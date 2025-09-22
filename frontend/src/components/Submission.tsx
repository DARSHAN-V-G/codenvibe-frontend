import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { round2Api } from '../api';
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
  
  // Form state
  const [promptStatements, setPromptStatements] = useState('');
  const [techStack, setTechStack] = useState('');
  const [githubLinks, setGithubLinks] = useState(['']);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');

  // Check if submission exists
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
          submissionId: data.submission?._id
        });
      } catch (error) {
        toast.error('Failed to check submission status');
      } finally {
        setLoading(false);
      }
    };

    if (questionId) {
      checkSubmission();
    }
  }, [questionId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    setSelectedImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

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
      githubLinks.forEach(link => {
        if (link.trim()) formData.append('github_link', link);
      });
      selectedImages.forEach(image => {
        formData.append('images', image);
      });

      const data = await round2Api.submit(formData);

      if (data.success) {
        toast.success('Submission successful!');
        navigate('/round2');
      } else {
        toast.error(data.error || 'Submission failed');
      }
    } catch (error) {
      toast.error('Error submitting solution');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-black" style={{ fontFamily: 'Patrick Hand, cursive' }}>
            Checking submission status...
          </p>
        </div>
      </div>
    );
  }

  if (submissionState.exists) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 
            className="text-4xl font-bold mb-6"
            style={{ fontFamily: 'Patrick Hand, cursive' }}
          >
            ✅ Already Submitted
          </h1>
          <Button
            onClick={() => navigate('/round2')}
            className="px-6 py-3 border-2 border-black bg-white text-black rounded-lg hover:bg-gray-100"
            style={{ fontFamily: 'Patrick Hand, cursive' }}
          >
            Back to Round 2 Questions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 
          className="text-4xl font-bold mb-8 text-center"
          style={{ fontFamily: 'Patrick Hand, cursive' }}
        >
          📝 Submit Your Solution
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <Label 
              htmlFor="prompt_statements"
              className="text-xl font-semibold"
              style={{ fontFamily: 'Patrick Hand, cursive' }}
            >
              Prompt Statements Used
            </Label>
            <Textarea
              id="prompt_statements"
              value={promptStatements}
              onChange={(e) => setPromptStatements(e.target.value)}
              className="min-h-[150px] border-2 border-black rounded-lg p-4"
              placeholder="Enter the prompt statements you used..."
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>

          <div className="space-y-4">
            <Label 
              htmlFor="tech_stack"
              className="text-xl font-semibold"
              style={{ fontFamily: 'Patrick Hand, cursive' }}
            >
              Tech Stack Used
            </Label>
            <Textarea
              id="tech_stack"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              className="min-h-[100px] border-2 border-black rounded-lg p-4"
              placeholder="List the technologies and frameworks used..."
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label 
                className="text-xl font-semibold"
                style={{ fontFamily: 'Patrick Hand, cursive' }}
              >
                GitHub Links
              </Label>
              <Button
                type="button"
                onClick={addGithubLink}
                className="px-4 py-2 border-2 border-black bg-white text-black rounded-lg hover:bg-gray-100"
                style={{ fontFamily: 'Patrick Hand, cursive' }}
              >
                + Add Link
              </Button>
            </div>
            {githubLinks.map((link, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={link}
                  onChange={(e) => updateGithubLink(index, e.target.value)}
                  placeholder="Enter GitHub repository link"
                  className="flex-1 border-2 border-black rounded-lg p-2"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
                {index > 0 && (
                  <Button
                    type="button"
                    onClick={() => removeGithubLink(index)}
                    className="px-3 py-2 border-2 border-red-500 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                  >
                    ✕
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <Label
              htmlFor="video_url"
              className="text-xl font-semibold"
              style={{ fontFamily: 'Patrick Hand, cursive' }}
            >
              Demo Video URL
            </Label>
            <div className="space-y-2">
              <Input
                id="video_url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="border-2 border-black rounded-lg p-2"
                placeholder="Enter your demo video URL..."
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
              <p className="text-sm text-gray-500">
                Upload your demo video to a platform (e.g., YouTube, Drive) and paste the link here
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Label 
              className="text-xl font-semibold"
              style={{ fontFamily: 'Patrick Hand, cursive' }}
            >
              Screenshots & Images
            </Label>
            <div className="grid grid-cols-2 gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg border-2 border-black"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {selectedImages.length < 10 && (
                <label className="border-2 border-dashed border-black rounded-lg h-48 flex items-center justify-center cursor-pointer hover:bg-gray-50">
                  <div className="text-center">
                    <span className="block text-4xl mb-2">+</span>
                    <span className="text-sm">Add Image</span>
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
            <p className="text-sm text-gray-500">
              Maximum 10 images allowed. Supported formats: PNG, JPG, JPEG
            </p>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              onClick={() => navigate('/round2')}
              className="px-6 py-3 border-2 border-gray-400 bg-white text-gray-600 rounded-lg hover:bg-gray-50"
              style={{ fontFamily: 'Patrick Hand, cursive' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 border-2 border-black bg-white text-black rounded-lg hover:bg-gray-100 disabled:opacity-50"
              style={{ fontFamily: 'Patrick Hand, cursive' }}
            >
              {submitting ? 'Submitting...' : 'Submit Solution'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}