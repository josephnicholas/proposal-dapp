# Design Patterns

## Emergency stop

- Imported from *Openzeppelin smart contracts*, the `PauserRole` is applied to the contract owner so that whenever there is an exception that wasn't caught during development or testing, the `owner` can pause the contract to stop the usage and fix the problem. Various functions in the contract are also disabled but not all, most `view` functions can be used for the user's preference.

## Pull over push

- Imported from *Openzeppelin smart contracts*, the `PullPayment` is applied for giving the reward to the applicant. The reward will be deposited to the contract's address first then withdrawn by the applicant. This kind of relates to a simple `escrow` service.

