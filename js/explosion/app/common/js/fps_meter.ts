
const ROLLING_TIMESPAN = 1000

interface FrameRateResults {
  avg: number,
  rolling: number[]
}

const getFramerate = (frames: number, periodMs: number) => Math.round(1000 * frames / periodMs)

export default function fps_meter() {
  let
    frames,
    rollingFramerate,
    startTime,
    finishTime,
    status: 'IDLE' | 'IN_PROGRESS' = 'IDLE'

  const refreshLoop = (framesInPeriod, lastTime) => {
    if (status === 'IN_PROGRESS') {
      window.requestAnimationFrame(currentTime => {
        if (currentTime > lastTime + ROLLING_TIMESPAN) {
          rollingFramerate.push(getFramerate(framesInPeriod, currentTime - lastTime))
          frames += framesInPeriod
          refreshLoop(0, currentTime)
        } else {
          refreshLoop(framesInPeriod + 1, lastTime)
        }
      })
    }
  }

  return {
    start() {
      startTime = performance.now()
      frames = 0
      rollingFramerate = []
      status = 'IN_PROGRESS'
      refreshLoop(0, startTime)
    },
    finish(): FrameRateResults {

      status = 'IDLE'
      finishTime = performance.now()

      return {
        avg: getFramerate(frames, finishTime - startTime),
        rolling: rollingFramerate
      }
    }
  }
}
