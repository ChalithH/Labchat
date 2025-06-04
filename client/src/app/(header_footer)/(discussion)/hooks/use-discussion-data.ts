"use client";

import { useState, useEffect, useCallback } from 'react';
import { useCurrentLabId } from '@/contexts/lab-context';
import api from '@/lib/api';
import { PostType } from '@/types/post.type';
import { CategoryType } from '@/types/category.type';
import { DiscussionType } from '@/types/discussion.type';

interface UseDiscussionDataReturn {
  recentPosts: PostType[];
  discussions: DiscussionType[];
  postsByDiscussion: PostType[][];
  categories: CategoryType[];
  postsByCategory: PostType[][];
  isLoading: boolean;
  error: string | null;
  refetchData: () => Promise<void>;
  fetchPostsByTag: (tagId: number) => Promise<PostType[]>;
  fetchPostsByDiscussion: (discussionId: number) => Promise<PostType[]>;
}

export function useDiscussionData(): UseDiscussionDataReturn {
  const currentLabId = useCurrentLabId();
  const [recentPosts, setRecentPosts] = useState<PostType[]>([]);
  const [discussions, setDiscussions] = useState<DiscussionType[]>([]);
  const [postsByDiscussion, setPostsByDiscussion] = useState<PostType[][]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [postsByCategory, setPostsByCategory] = useState<PostType[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentPosts = useCallback(async (labId: number): Promise<PostType[]> => {
    try {
      const response = await api.get(`/discussion/recent/9?labId=${labId}`);
      return response.data;
    } catch (err) {
      console.error('Error fetching recent posts:', err);
      throw err;
    }
  }, []);

  const fetchDiscussions = useCallback(async (labId: number): Promise<DiscussionType[]> => {
    try {
      const response = await api.get(`/discussion/lab/discussions?labId=${labId}`);
      return response.data;
    } catch (err) {
      console.error('Error fetching discussions:', err);
      throw err;
    }
  }, []);

  const fetchPostsByDiscussion = useCallback(async (discussionId: number): Promise<PostType[]> => {
    try {
      const response = await api.get(`/discussion/category-posts/${discussionId}`);
      return response.data;
    } catch (err) {
      console.error('Error fetching posts by discussion:', err);
      throw err;
    }
  }, []);

  const fetchCategories = useCallback(async (labId: number): Promise<CategoryType[]> => {
    try {
      const response = await api.get(`/discussion/lab/tags?labId=${labId}`);
      return response.data;
    } catch (err) {
      console.error('Error fetching categories:', err);
      throw err;
    }
  }, []);

  const fetchPostsByTag = useCallback(async (tagId: number, labId?: number): Promise<PostType[]> => {
    try {
      const labParam = labId ? `?labId=${labId}` : '';
      const response = await api.get(`/discussion/lab/tags/${tagId}/posts${labParam}`);
      return response.data;
    } catch (err) {
      console.error('Error fetching posts by tag:', err);
      throw err;
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    if (!currentLabId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch recent posts, discussions, and categories in parallel
      const [recentPostsData, discussionsData, categoriesData] = await Promise.all([
        fetchRecentPosts(currentLabId),
        fetchDiscussions(currentLabId),
        fetchCategories(currentLabId)
      ]);

      setRecentPosts(recentPostsData);
      setDiscussions(discussionsData);
      setCategories(categoriesData);

      // Fetch posts for each discussion
      if (discussionsData.length > 0) {
        const discussionPostsData = await Promise.all(
          discussionsData.map(discussion => fetchPostsByDiscussion(discussion.id))
        );
        setPostsByDiscussion(discussionPostsData);
      } else {
        setPostsByDiscussion([]);
      }

      // Fetch posts for each category (for tag-based filtering)
      if (categoriesData.length > 0) {
        const categoryPostsData = await Promise.all(
          categoriesData.map(category => fetchPostsByTag(category.id, currentLabId))
        );
        setPostsByCategory(categoryPostsData);
      } else {
        setPostsByCategory([]);
      }
    } catch (err) {
      setError('Failed to fetch discussion data');
      console.error('Error fetching discussion data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentLabId, fetchRecentPosts, fetchDiscussions, fetchCategories, fetchPostsByTag, fetchPostsByDiscussion]);

  const refetchData = useCallback(async () => {
    await fetchAllData();
  }, [fetchAllData]);

  const fetchPostsByTagPublic = useCallback(async (tagId: number): Promise<PostType[]> => {
    return fetchPostsByTag(tagId, currentLabId);
  }, [fetchPostsByTag, currentLabId]);

  const fetchPostsByDiscussionPublic = useCallback(async (discussionId: number): Promise<PostType[]> => {
    return fetchPostsByDiscussion(discussionId);
  }, [fetchPostsByDiscussion]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    recentPosts,
    discussions,
    postsByDiscussion,
    categories,
    postsByCategory,
    isLoading,
    error,
    refetchData,
    fetchPostsByTag: fetchPostsByTagPublic,
    fetchPostsByDiscussion: fetchPostsByDiscussionPublic,
  };
} 