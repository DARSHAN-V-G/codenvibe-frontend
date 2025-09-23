import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { round2Api } from '../api';
import { Navigation } from './Navigation';
import toast from 'react-hot-toast';

interface SubmissionState {
  exists: boolean;
  submissionId?: string;
}

export function Submission() {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submissionState, setSubmissionState] = useState<SubmissionState>({ exists: false });
  const [submitting, setSubmitting] = useState(false);

  // form state
  const [promptStatements, setPromptStatements] = useState('');
  const [techStack, setTechStack] = useState('');
  const [githubLinks, setGithubLinks] = useState<string[]>(['']);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');

  /** Check if a submission already exists */
  useEffect(() => {
    const checkSubmission = async () => {
      try {
        if (!questionId) return;
        const data = await round2Api.checkSubmission(questionId);
        if (data.error) {
          toast.error(data.error);
          return;
        }
        setSubmissionState({
          exists: data.exists,
          submissionId: data.submission?._id,
        });
      } catch {
        toast.error('Failed to check submission status');
      } finally {
        setLoading(false);
      }
    };
    checkSubmission();
  }, [questionId]);

  /** Image handling */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from<File>(e.target.files || []);
    if (files.length + selectedImages.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    setSelectedImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  /** GitHub links handling */
  const addGithubLink = () => {
    if (githubLinks.length < 5) {
      setGithubLinks([...githubLinks, '']);
    } else {
      toast.error('Maximum 5 GitHub links allowed');
    }
  };

  const removeGithubLink = (index: number) => {
    setGithubLinks(githubLinks.filter((_, i) => i !== index));
  };

  const updateGithubLink = (index: number, value: string) => {
    const newLinks = [...githubLinks];
    newLinks[index] = value;
    setGithubLinks(newLinks);
  };

  /** Form submission */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!promptStatements.trim() || !techStack.trim() || !githubLinks[0].trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('questionid', questionId || '');
      formData.append('prompt_statements', promptStatements);
      formData.append('tech_stack_used', techStack);
      formData.append('video_url', videoUrl.trim());
      githubLinks.forEach((link) => {
        if (link.trim()) formData.append('github_link', link);
      });
      selectedImages.forEach((image) => {
        formData.append('images', image);
      });

      const data = await round2Api.submit(formData);
      if (data.success) {
        toast.success('Submission successful!');
        navigate('/round2');
      } else {
        toast.error(data.error || 'Submission failed');
      }
    } catch {
      toast.error('Error submitting solution');
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- UI STATES ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation
          currentPage="questions"
          onNavigate={(page) => navigate(`/${page}`)}
          isLoggedIn
        />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-black font-main">Checking submission status...</p>
          </div>
        </div>
      </div>
    );
  }

  if (submissionState.exists) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation
          currentPage="questions"
          onNavigate={(page) => navigate(`/${page}`)}
          isLoggedIn
        />
        <div className="max-w-7xl mx-auto px-8 py-6 text-center">
          <h1 className="text-6xl font-bold text-black mb-4 font-main">
            Already Submitted
          </h1>
          <Button
            onClick={() => navigate('/round2')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:scale-105 transition-transform font-main text-lg mt-4"
          >
            Back to Round 2 Questions
          </Button>
        </div>
      </div>
    );
  }

  /* ---------- MAIN FORM ---------- */
  return (
    <div className="min-h-screen bg-white">
      <Navigation
        currentPage="questions"
        onNavigate={(page) => navigate(`/${page}`)}
        isLoggedIn
      />

      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-black mb-4 font-main">
            Submit Your Solution
          </h1>
          <p className="text-xl text-gray-600 font-main">
            Share your innovative approach and implementation
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl border-2 border-[#5aa4f6]/30 p-8 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Prompt Statements */}
                <div className="space-y-2">
                  <Label htmlFor="prompt_statements" className="text-lg font-main">
                    Prompt Statements
                  </Label>
                  <Textarea
                    id="prompt_statements"
                    value={promptStatements}
                    onChange={(e) => setPromptStatements(e.target.value)}
                    placeholder="Enter your prompt statements"
                    className="min-h-[8rem] border-[#5aa4f6]/30 focus:border-[#5aa4f6] focus:ring-[#5aa4f6] bg-white font-main"
                    required
                  />
                  <div className="text-sm text-gray-500 text-right font-main">
                    {promptStatements.length}/500 characters
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="space-y-2">
                  <Label htmlFor="tech_stack" className="text-lg font-main">
                    Tech Stack
                  </Label>
                  <Textarea
                    id="tech_stack"
                    value={techStack}
                    onChange={(e) => setTechStack(e.target.value)}
                    placeholder="List the technologies used"
                    className="min-h-[6rem] border-[#5aa4f6]/30 focus:border-[#5aa4f6] focus:ring-[#5aa4f6] bg-white font-main"
                    required
                  />
                  <div className="text-sm text-gray-500 text-right font-main">
                    {techStack.length}/200 characters
                  </div>
                </div>

                {/* GitHub Links */}
                <div className="space-y-4">
                  <Label className="text-lg font-main">GitHub Links</Label>
                  {githubLinks.map((link, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="url"
                        value={link}
                        onChange={(e) => updateGithubLink(index, e.target.value)}
                        placeholder="GitHub repository link"
                        className="flex-1 border-[#5aa4f6]/30 focus:border-[#5aa4f6] focus:ring-[#5aa4f6] bg-white font-main"
                        required={index === 0}
                      />
                      {index > 0 && (
                        <Button
                          type="button"
                          onClick={() => removeGithubLink(index)}
                          className="px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 font-main"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  {githubLinks.length < 5 && (
                    <Button
                      type="button"
                      onClick={addGithubLink}
                      className="bg-white text-[#5aa4f6] border-2 border-[#5aa4f6]/30 hover:bg-[#5aa4f6]/5 font-main"
                    >
                      Add Another Link
                    </Button>
                  )}
                </div>

                {/* Demo Video */}
                <div className="space-y-2">
                  <Label htmlFor="video_url" className="text-lg font-main">
                    🎥 Demo Video
                  </Label>
                  <Input
                    id="video_url"
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="Enter your demo video URL"
                    className="border-[#5aa4f6]/30 focus:border-[#5aa4f6] focus:ring-[#5aa4f6] bg-white font-main"
                  />
                  <p className="text-sm text-gray-500 font-main">
                    Upload your demo video to a platform (YouTube, Drive) and paste the link here.
                  </p>
                </div>
              </div>

              {/* Right Column - Images */}
              <div className="space-y-4">
                <Label className="text-lg font-main">Screenshots & Images</Label>
                <div className="border-2 border-dashed border-[#5aa4f6]/30 rounded-xl p-6 bg-[#5aa4f6]/5">
                  <div className="grid grid-cols-2 gap-4">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border border-[#5aa4f6]/30"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 rounded-full w-6 h-6 flex items-center justify-center shadow-lg border border-gray-200"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {selectedImages.length < 10 && (
                      <label className="border-2 border-[#5aa4f6]/30 rounded-lg h-48 flex flex-col items-center justify-center cursor-pointer hover:bg-[#5aa4f6]/10 transition-colors">
                        <div className="text-center space-y-2">
                          <div className="w-12 h-12 rounded-full bg-[#5aa4f6]/10 flex items-center justify-center mx-auto">
                            <span className="text-2xl text-[#5aa4f6]">+</span>
                          </div>
                          <span className="text-sm font-main text-gray-600">Add Screenshots</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </div>
                      </label>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-4 font-main">
                    Drop your screenshots here or click to upload (max 10 images)
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 mt-8">
              <Button
                type="button"
                onClick={() => navigate('/round2')}
                className="px-6 py-3 bg-white text-gray-600 rounded-lg hover:bg-gray-50 font-main border border-gray-200"
              >
                Cancel
              </Button>
              <Button
  type="submit"
  disabled={submitting}
  className="px-6 py-3 bg-white text-gray-600 rounded-lg hover:bg-gray-50 font-main border border-gray-200"
              >
  {submitting ? 'Submitting...' : 'Submit Solution'}
</Button>


            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Submission;
