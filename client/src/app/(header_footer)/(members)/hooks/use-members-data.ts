"use client";

import { useState, useEffect, useCallback } from "react";
import { useCurrentLabId } from "@/contexts/lab-context";
import axios from "axios";
import type { LabMember } from "@/app/(header_footer)/(members)/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type FilterOption = {
  label: string;
  value: string;
};

export function useMembersData() {
  const currentLabId = useCurrentLabId();
  const [members, setMembers] = useState<LabMember[]>([]);
  const [availableStatusOptions, setAvailableStatusOptions] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch members for the current lab
  const fetchMembers = useCallback(async () => {
    try {
      setError(null);
      const response = await axios.get(`${API_URL}/lab/getMembers/${currentLabId}`);
      
      if (response.status !== 200) {
        throw new Error("Failed to fetch members");
      }

      const data = response.data;
      console.log("Fetched members:", data);
      setMembers(data);
      return data;
    } catch (err) {
      console.error("Failed to fetch members:", err);
      setError("Failed to load members. Please try again later.");
      return [];
    }
  }, [currentLabId]);

  // Fetch available member statuses
  const fetchStatusOptions = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/member/statuses`);
      if (!response.ok) {
        throw new Error('Failed to fetch member statuses');
      }
      const statuses: { statusName: string }[] = await response.json();
      const options: FilterOption[] = statuses.map(({ statusName }) => ({
        label: statusName,
        value: statusName.toLowerCase()
      }));
      setAvailableStatusOptions([{ label: 'All Statuses', value: '' }, ...options]);
      return options;
    } catch (err) {
      console.error('Error fetching status options:', err);
      setError('Failed to fetch status options');
      return [];
    }
  }, []);

  // Initialize data when lab changes
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchMembers(),
          fetchStatusOptions()
        ]);
      } catch (err) {
        console.error("Failed to initialize members data:", err);
        setError("Failed to initialize members data");
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [currentLabId, fetchMembers, fetchStatusOptions]);

  // Utility function to get sorted members
  const getSortedMembers = useCallback((membersToSort: LabMember[] = members) => {
    return [...membersToSort].sort((a, b) => {
      const aStatusWeight = a.status.find((s) => s.isActive)?.status.statusWeight || 0;
      const bStatusWeight = b.status.find((s) => s.isActive)?.status.statusWeight || 0;

      if (bStatusWeight !== aStatusWeight) {
        return bStatusWeight - aStatusWeight;
      }

      return a.displayName.localeCompare(b.displayName);
    });
  }, [members]);

  // Utility function to filter members
  const getFilteredMembers = useCallback((searchQuery: string, statusFilter: string) => {
    const sortedMembers = getSortedMembers();
    
    return sortedMembers.filter((member) => {
      const matchesSearch =
        member.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());

      const activeStatus = member.status.find((s) => s.isActive)?.status.statusName.toLowerCase();
      const matchesStatus =
        statusFilter === "" || (activeStatus && activeStatus === statusFilter.toLowerCase());

      return matchesSearch && matchesStatus;
    });
  }, [getSortedMembers]);

  return {
    currentLabId,
    members,
    availableStatusOptions,
    loading,
    error,
    fetchMembers,
    fetchStatusOptions,
    getSortedMembers,
    getFilteredMembers,
    setMembers,
  };
} 