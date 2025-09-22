import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api.ts';
import { Loader2, ExternalLink, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Round2Submissions() {
  const { questionId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmissions();
  }, [questionId]);

  const fetchSubmissions = async () => {
    try {
      const response = await api.getRound2Submissions(questionId);
      if (response.success && response.data) {
        setSubmissions(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch submissions');
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/round2')}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Questions
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Question Submissions</h1>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No submissions found for this question.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {submissions.map((submission) => (
            <div key={submission._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                {/* Team Information */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {submission.team.team_name}
                  </h2>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p className="font-medium">Team Members:</p>
                      <ul className="list-disc list-inside">
                        {submission.team.members.map((member, index) => (
                          <li key={index}>{member}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium">Roll Numbers:</p>
                      <ul className="list-disc list-inside">
                        {submission.team.roll_nos.map((roll, index) => (
                          <li key={index}>{roll}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Submission Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Prompt Statements</h3>
                    <div className="bg-gray-50 rounded p-4 whitespace-pre-wrap">
                      {submission.prompt_statements}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Tech Stack</h3>
                    <div className="bg-gray-50 rounded p-4 whitespace-pre-wrap">
                      {submission.tech_stack_used}
                    </div>
                  </div>

                  {/* GitHub Links */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">GitHub Links</h3>
                    <div className="space-y-2">
                      {submission.github_link.map((link, index) => (
                        <a
                          key={index}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          {link}
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Video */}
                  {submission.video_url && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Demo Video</h3>
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                        {(() => {
                          // Helper function to get YouTube video ID
                          const getYouTubeId = (url) => {
                            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                            const match = url.match(regExp);
                            return (match && match[2].length === 11) ? match[2] : null;
                          };

                          // Helper function to get Google Drive viewing URL
                          const getGoogleDriveEmbedUrl = (url) => {
                            const fileId = url.match(/\/d\/([^/]*)/)?.[1];
                            return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : null;
                          };

                          const url = submission.video_url;
                          
                          // Handle YouTube URLs
                          if (url.includes('youtube.com') || url.includes('youtu.be')) {
                            const videoId = getYouTubeId(url);
                            if (videoId) {
                              return (
                                <iframe
                                  src={`https://www.youtube.com/embed/${videoId}`}
                                  className="absolute top-0 left-0 w-full h-full"
                                  title="YouTube video player"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              );
                            }
                          }
                          
                          // Handle Google Drive URLs
                          if (url.includes('drive.google.com')) {
                            const embedUrl = getGoogleDriveEmbedUrl(url);
                            if (embedUrl) {
                              return (
                                <iframe
                                  src={embedUrl}
                                  className="absolute top-0 left-0 w-full h-full"
                                  title="Google Drive video player"
                                  frameBorder="0"
                                  allowFullScreen
                                />
                              );
                            }
                          }
                          
                          // For direct video URLs, use video tag
                          if (url.match(/\.(mp4|webm|ogg)$/i)) {
                            return (
                              <video
                                src={url}
                                className="w-full h-full"
                                controls
                                controlsList="nodownload"
                                poster={submission.image_url[0]}
                              >
                                Your browser does not support the video tag.
                              </video>
                            );
                          }
                          
                          // Fallback for other URLs
                          return (
                            <div className="flex items-center justify-center h-full">
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Open Video
                              </a>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Images */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Screenshots</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {submission.image_url.map((url, index) => (
                        <div key={index} className="relative aspect-video">
                          <img
                            src={url}
                            alt={`Screenshot ${index + 1}`}
                            className="rounded-lg shadow-md object-cover w-full h-full"
                          />
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="flex justify-between text-sm text-gray-500 mt-4 pt-4 border-t">
                    <span>Submitted: {formatDate(submission.createdAt)}</span>
                    <span>Last Updated: {formatDate(submission.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}