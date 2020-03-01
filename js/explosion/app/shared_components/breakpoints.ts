const sassVariables: {
  [key: string]: string
} = require('!!sass-variables-loader!shared_components/variables.scss')

const toInt = (width: string): number => parseInt(width.replace('px', ''), 10)

export default {
  min: sassVariables.screenMin,
  xsmall: sassVariables.screenXsmall,
  small: sassVariables.screenSmall,
  medium: sassVariables.screenMedium,
  max: sassVariables.screenMax,
  int: {
    min: toInt(sassVariables.screenMin),
    xsmall: toInt(sassVariables.screenXsmall),
    small: toInt(sassVariables.screenSmall),
    medium: toInt(sassVariables.screenMedium),
    max: toInt(sassVariables.screenMax),
  },
}
