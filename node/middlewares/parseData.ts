import { json } from 'co-body'
import { v4 as uuidv4 } from 'uuid';

export async function parseData(ctx: Context, next: () => Promise<unknown>) {

  const {
    req,
    vtex: { logger },
    clients: { checkoutOrders, giftCards }
  } = ctx
  try {

    console.log("parseFile")

    const { emails } = await json(req)

    console.log(emails)

    const results = []

    for (const email of emails) {
      console.log(email);

      const data = await checkoutOrders.getUserByEmail(email[0])
      console.log(data)
      const giftCardData = {
        "relationName": "loyalty-program-test",
        "expiringDate": email[2],
        "caption": "Vtex Loyalty Test",
        "profileId": data.userProfileId,
        "restrictedToOwner": true,
        "currencyCode": "COP",
        "multipleCredits": true,
        "multipleRedemptions": false
      }
      const createdGiftCard = await giftCards.createGiftCard(giftCardData)
      console.log(createdGiftCard)
      const balanceData = {
        id: createdGiftCard.id,
        "operation": "Credit",
        "value": email[1],
        "description": "Opening balance",
        "redemptionToken": createdGiftCard.redemptionToken,
        "redemptionCode": createdGiftCard.redemptionCode,
        "requestId": uuidv4()
      }
      const newGiftCard = await giftCards.addBalance(balanceData)
      console.log(newGiftCard)

      results.push({
        giftCard: createdGiftCard,
        client: data.userProfile,
      })
    }

    ctx.status = 200
    ctx.message = 'ok'
    ctx.body = results

  } catch (error) {
    console.log(JSON.stringify(error, null, '\t'))
    logger.error(error.message)

    ctx.status = 500
    ctx.message = error.message

    return
  }

  await next()
}
