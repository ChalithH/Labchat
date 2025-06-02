"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Building2, Loader2, CheckCircle } from "lucide-react"
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface SimpleLab {
  labId: number
  name: string
  isCurrentLab: boolean
}

interface SimpleLabSwitcherProps {
  userId: number
  onLabChange?: (labId: number) => void
  placeholder?: string
  className?: string
}

export function SimpleLabSwitcher({
  userId,
  onLabChange,
  placeholder = "Select lab...",
  className = "",
}: SimpleLabSwitcherProps) {
  const [labs, setLabs] = useState<SimpleLab[]>([])
  const [loading, setLoading] = useState(true)
  const [switching, setSwitching] = useState(false)
  const [selectedLabId, setSelectedLabId] = useState<string>("")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingLabId, setPendingLabId] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const response = await axios.get(`${API_URL}/user/available-labs/${userId}`)
        const labsData = response.data.map((lab: any) => ({
          labId: lab.labId,
          name: lab.lab.name,
          isCurrentLab: lab.isCurrentLab,
        }))

        setLabs(labsData)

        const currentLab = labsData.find((lab: SimpleLab) => lab.isCurrentLab)
        if (currentLab) {
          setSelectedLabId(currentLab.labId.toString())
        }
      } catch (error) {
        console.error("Failed to fetch labs:", error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchLabs()
    }
  }, [userId])

  const handleSelectChange = (labId: string) => {
    if (!labId || switching) return

    const labIdNum = Number.parseInt(labId)

    // Don't switch if it's already the current lab
    const targetLab = labs.find((lab) => lab.labId === labIdNum)
    if (targetLab?.isCurrentLab) {
      return
    }

    // Show confirmation dialog
    setPendingLabId(labId)
    setShowConfirmDialog(true)
  }

  const handleConfirmSwitch = async () => {
    if (!pendingLabId) return

    const labIdNum = Number.parseInt(pendingLabId)
    setSwitching(true)
    setShowConfirmDialog(false)

    try {
      await axios.put(`${API_URL}/user/switch-lab/${userId}`, {
        labId: labIdNum,
      })

      setSelectedLabId(pendingLabId)
      setLabs((prev) =>
        prev.map((lab) => ({
          ...lab,
          isCurrentLab: lab.labId === labIdNum,
        })),
      )

      onLabChange?.(labIdNum)
      router.refresh()
    } catch (error) {
      console.error("Failed to switch lab:", error)
      // Reset selection to current lab on error
      const currentLab = labs.find((lab) => lab.isCurrentLab)
      if (currentLab) {
        setSelectedLabId(currentLab.labId.toString())
      }
    } finally {
      setSwitching(false)
      setPendingLabId("")
    }
  }

  const handleCancelSwitch = () => {
    setShowConfirmDialog(false)
    setPendingLabId("")
    // Keep the current selection
  }

  const getCurrentLabName = () => {
    const currentLab = labs.find((lab) => lab.labId.toString() === selectedLabId)
    return currentLab?.name || ""
  }

  const getPendingLabName = () => {
    const pendingLab = labs.find((lab) => lab.labId.toString() === pendingLabId)
    return pendingLab?.name || ""
  }

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading labs...</span>
      </div>
    )
  }

  if (labs.length === 0) {
    return (
      <div className={`flex items-center space-x-2 text-gray-500 ${className}`}>
        <Building2 className="h-4 w-4" />
        <span className="text-sm">No labs available</span>
      </div>
    )
  }

  return (
    <>
      <Select value={selectedLabId} onValueChange={handleSelectChange} disabled={switching}>
        <SelectTrigger className={className}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2 min-w-0">
              <Building2 className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{getCurrentLabName() || placeholder}</span>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              {switching && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
          </div>
        </SelectTrigger>

        <SelectContent>
          {labs.map((lab) => (
            <SelectItem key={lab.labId} value={lab.labId.toString()}>
              <div className="flex items-center space-x-2 w-full">
                <span className="flex-1">{lab.name}</span>
                {lab.isCurrentLab}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Switch Lab</DialogTitle>
            <DialogDescription>
              Are you sure you want to switch from <strong>{getCurrentLabName()}</strong> to{" "}
              <strong>{getPendingLabName()}</strong>?
              <br />
              <br />
              This will change your current working environment and may affect your ongoing work.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelSwitch}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSwitch}>Switch Lab</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
