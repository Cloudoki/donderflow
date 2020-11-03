import { Signale } from 'signale'

const options = {
  disabled: false,
  interactive: false,
  stream: process.stdout,
  scope: 'donderflow',
  config: {
    displayLabel: false,
  },
}

export default new Signale(options)
