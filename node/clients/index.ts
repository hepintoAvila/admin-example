import { IOClients } from '@vtex/api'

import Status from './status'
import { CheckoutOrders } from './checkoutOrders'
import { GiftCards } from './giftCardClient'

// Extend the default IOClients implementation with our own custom clients.
export class Clients extends IOClients {
  public get status() {
    return this.getOrSet('status', Status)
  }

  public get checkoutOrders() {
    return this.getOrSet('checkoutOrders', CheckoutOrders)
  }

  public get giftCards() {
    return this.getOrSet('giftCards', GiftCards)
  }
}
