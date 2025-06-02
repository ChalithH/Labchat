import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { Reaction } from '@/types/reaction.type'
import React, { useEffect, useState } from 'react'

type ReactionTargetType = 'post' | 'reply'

type ReactionBarProps = {
  id: number
  currentUserId: number
  type: ReactionTargetType
  variant?: 'default' | 'readonly'
}

const ReactionBar = ({ id, currentUserId, type, variant = 'default'}: ReactionBarProps) => {
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [userReaction, setUserReaction] = useState<number | null>(null)

  useEffect(() => {
    const fetchReactions = async () => {
      const { data } = await api.get<Reaction[]>(`/discussion/reactions/${type}/${id}`)
      setReactions(data)

      const existing = data.find(r => r.memberId === currentUserId)
      if (existing) setUserReaction(existing.reactionId)
    }

    fetchReactions()
  }, [id, currentUserId, type])

  const handleReact = async (reactionId: number) => {
    await api.post('/discussion/reactions/toggle', {
      targetId: id,
      targetType: type,
      memberId: currentUserId,
      reactionId
    })

    const { data } = await api.get<Reaction[]>(`/discussion/reactions/${type}/${id}`)
    setReactions(data)

    const existing = data.find(reaction => reaction.memberId === currentUserId)
    setUserReaction(existing ? existing.reactionId : null)
  }

  const countReactions = (id: number) => reactions.filter(r => r.reactionId === id).length

  return (
    <div className="flex space-x-2 rounded-sm w-fit">
      <Button
        variant='outline'
        size="sm"
        className={`${userReaction === 1 ? 'text-yellow-600' : ''}`}
        onClick={variant === 'default' ? () => handleReact(1) : undefined}
        disabled={variant === 'readonly'}>
        <p className="play-font">
          👍 {countReactions(1)}
        </p>
      </Button>

      <Button
        variant='outline'
        size="sm"
        className={`${userReaction === 2 ? 'text-red-600' : ''}`}
        onClick={variant === 'default' ? () => handleReact(2) : undefined}
        disabled={variant === 'readonly'}>
        <p className="play-font">
          👎 {countReactions(2)}
        </p>
      </Button>
    </div>
  )
}

export default ReactionBar
