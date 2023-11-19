import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'
import { apiKey, apiToken } from '../env'

export class GiftCards extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super(`https://${ctx.account}.vtexcommercestable.com.br/api/giftcards`, ctx, {
      ...options,
      headers: {
        ...options?.headers,
        VtexIdclientAutCookie:
          ctx.storeUserAuthToken ?? ctx.adminUserAuthToken ?? ctx.authToken,
        'X-VTEX-API-AppKey': apiKey,
        'X-VTEX-API-AppToken': apiToken,
      },
    })
  }

  public createGiftCard = async (info: any): Promise<any> => {
    const response = await this.http.post(
      `/`,
      info
    )
    console.log(response)
    return response
  }

  public addBalance = async (info: any) => {
    const response = await this.http.post(
      `/${info.id}/transactions`,
      info
    )
    console.log(response)
    return response
  }
}
//
