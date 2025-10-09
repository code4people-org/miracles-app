'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, XCircle, Eye, BarChart3, Users, FileText } from 'lucide-react';
import { AdminUtils, ContentViolation, ViolationStats } from '@/lib/adminUtils';

interface PendingContent {
  id: string;
  title: string;
  description: string;
  category: string;
  urgency?: string;
  user_id: string;
  created_at: string;
  content_type: 'miracle' | 'prayer_request';
  profiles: {
    full_name: string;
    email: string;
  };
}

export default function ContentModerationDashboard() {
  const [pendingContent, setPendingContent] = useState<PendingContent[]>([]);
  const [violations, setViolations] = useState<ContentViolation[]>([]);
  const [stats, setStats] = useState<ViolationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<PendingContent | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pending, violationsData, statsData] = await Promise.all([
        AdminUtils.getPendingContent(),
        AdminUtils.getContentViolations(50),
        AdminUtils.getViolationStats()
      ]);
      
      setPendingContent(pending);
      setViolations(violationsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (contentId: string, contentType: 'miracle' | 'prayer_request') => {
    const success = await AdminUtils.approveContent(contentId, contentType);
    if (success) {
      await fetchData(); // Refresh data
    }
  };

  const handleReject = async (contentId: string, contentType: 'miracle' | 'prayer_request') => {
    if (!rejectReason.trim()) return;
    
    const success = await AdminUtils.rejectContent(contentId, contentType, rejectReason, 'admin');
    if (success) {
      setSelectedContent(null);
      setRejectReason('');
      await fetchData(); // Refresh data
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-miracle-gold"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Content Moderation Dashboard</h1>
      
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-orange-500 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Pending Review</h3>
                <p className="text-2xl font-bold text-orange-600">{pendingContent.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-500 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Violations</h3>
                <p className="text-2xl font-bold text-red-600">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Violation Types</h3>
                <p className="text-2xl font-bold text-blue-600">{Object.keys(stats.byType).length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Content Types</h3>
                <p className="text-2xl font-bold text-green-600">{Object.keys(stats.byContentType).length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Content */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Pending Content ({pendingContent.length})</h2>
        </div>
        
        <div className="p-6">
          {pendingContent.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-500">No content pending review</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingContent.map((content) => (
                <motion.div
                  key={content.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 mb-1">{content.title}</h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{content.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded">{content.category}</span>
                        <span className="bg-blue-100 px-2 py-1 rounded">{content.content_type}</span>
                        {content.urgency && (
                          <span className="bg-purple-100 px-2 py-1 rounded">{content.urgency}</span>
                        )}
                        <span>{new Date(content.created_at).toLocaleDateString()}</span>
                        <span>by {content.profiles.full_name}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => setSelectedContent(content)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleApprove(content.id, content.content_type)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Approve"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => setSelectedContent(content)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Reject"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold mb-4">Reject Content</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Title:</strong> {selectedContent.title}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Type:</strong> {selectedContent.content_type}
              </p>
            </div>
            
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="w-full p-3 border rounded-lg mb-4"
              rows={3}
            />
            
            <div className="flex space-x-3">
              <button
                onClick={() => handleReject(selectedContent.id, selectedContent.content_type)}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  setSelectedContent(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
