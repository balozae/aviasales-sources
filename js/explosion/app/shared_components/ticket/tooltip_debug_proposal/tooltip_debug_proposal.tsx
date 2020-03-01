import React from 'react'
import clssnms from 'clssnms'
import { Proposal } from '../ticket.types'
import Tooltip from 'shared_components/tooltip'
import './tooltip_debug_proposal.scss'

const cn = clssnms('tooltip-debug-proposal')

interface TooltipDebugProposalProps {
  proposal?: Proposal
  withDebug?: boolean
  origGateId?: number
  children?: React.ReactNode
}

const TooltipDebugProposal: React.FC<TooltipDebugProposalProps> = (props) => {
  const { proposal, withDebug, origGateId } = props
  if (!(withDebug && proposal)) {
    return <>{props.children}</>
  }
  const worstBags = proposal.worstBags
  const configProductivity =
    proposal.debugProposalMultiplier && proposal.debugMultiplier
      ? (proposal.debugMultiplier - 0.000001) / proposal.debugProposalMultiplier
      : null

  return (
    <Tooltip
      position="bottom"
      tooltip={() => {
        return (
          <div className={cn()}>
            Gate id: {proposal.gateId} <br />
            Ticket info gate id: {origGateId}
            <span className={cn('item')}>Productivity: {proposal.debugProductivity}</span>
            <span className={cn('item')}>Multiplier: {proposal.debugMultiplier}</span>
            <span className={cn('item')}>
              ProposalMultiplier: {proposal.debugProposalMultiplier || 'unknown'}
            </span>
            <span className={cn('item')}>
              ConfigProductivity: {configProductivity || 'unknown'}
            </span>
            <span className={cn('item')}>
              Багаж: {worstBags && worstBags.baggage.code}; {worstBags && worstBags.baggage.debug}
            </span>
            <span className={cn('item')}>
              Кладь: {worstBags && worstBags.handbags.code}; {worstBags && worstBags.handbags.debug}
            </span>
          </div>
        )
      }}
    >
      {props.children}
    </Tooltip>
  )
}

export default React.memo(TooltipDebugProposal)
