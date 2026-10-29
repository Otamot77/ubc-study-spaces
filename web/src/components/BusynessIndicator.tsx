import { CircleAlert, CircleCheck, CircleDot, CircleHelp } from 'lucide-react'
import type { Busyness } from '../types'

const states = {
  low: { label: 'Plenty of seats', Icon: CircleCheck },
  moderate: { label: 'Some seats', Icon: CircleDot },
  high: { label: 'Almost full', Icon: CircleAlert },
  unknown: { label: 'Unknown', Icon: CircleHelp },
} as const

interface Props {
  busyness: Busyness
}

export function BusynessIndicator({ busyness }: Props) {
  const { label, Icon } = states[busyness]
  return (
    <span className={'busyness busyness--' + busyness}>
      <Icon size={17} strokeWidth={2} aria-hidden="true" />
      <span>{label}</span>
    </span>
  )
}
