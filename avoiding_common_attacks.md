# Avoiding attacks

## Reentrancy attack

- Imported from *Openzeppelin smart contracts*, the `PullPayment` is applied not just as an withdrawal strategy but this also prevents blocking execution and reentrancy attacks.

## Buffer overflow and underflow

- Imported from *Openzeppelin smart contracts*, the `SafeMath` library is used for mathematical calculations to avoid certain underflows and overflows when calculating the rewards.