import {loadAllItems, loadPromotions} from './Dependencies'

export function printReceipt(tags: string[]): string {
  const selectedTags = processInput(tags)
  // const selectedItems = getItemByID (selectedTags)
  const selectedItemCharge = generateItemChargeArray(selectedTags)
  const updatedItemCharge = isItemInPromotion(selectedItemCharge)
  const itemSubtotalArray = getSubtotal(updatedItemCharge, selectedTags)
  const totalPrice = calculatedTotalPrice (itemSubtotalArray)
  const totalDiscount = calculatedDiscount (itemSubtotalArray)
  const renderedItems = renderItems (itemSubtotalArray, selectedTags)
  const renderedTotalPriceAndDiscount = renderTotalandDiscount(totalPrice, totalDiscount)
  const top = '***<store earning no money>Receipt ***'
  return top + '\n' + renderedItems + '\n' + renderedTotalPriceAndDiscount
}
export class ItemCharge {
  barcode: string
  subtotal: number
  isInPromotion: boolean
  discountedMoney: number
  constructor(barcode: string, subtotal: number, promotion: boolean, discountedMoney: number)
  {
    this.barcode = barcode
    this.subtotal = subtotal
    this.isInPromotion = promotion
    this.discountedMoney = discountedMoney
  }
}

function renderItems (itemSubtotalArray: ItemCharge[], selectedTags: Map<string, number>): string {
  const itemInfos = loadAllItems()
  return itemSubtotalArray.map (item => {
    const barcode = item.barcode
    const itemInfo = itemInfos.filter(itemIn => itemIn.barcode === barcode)
    const printLine = `Name：${itemInfo[0].name}，Quantity：${selectedTags.get(barcode)} ${itemInfo[0].unit}s，Unit：${itemInfo[0].price.toFixed(2)}(yuan)，Subtotal：${item.subtotal.toFixed(2)}(yuan)`
    return printLine
  }).join('\n')
}

function renderTotalandDiscount(totalPrice: number, totalDiscount: number): string{
  const result = `----------------------
Total：${totalPrice.toFixed(2)}(yuan)
Discounted prices：${totalDiscount.toFixed(2)}(yuan)
**********************`
  return result
}

function calculatedTotalPrice (itemSubtotalArray: ItemCharge[]): number {
  let totalPrice = 0
  for(let index = 0; index < itemSubtotalArray.length; index++)
  {
    totalPrice += itemSubtotalArray[index].subtotal
  }
  return totalPrice
}

function calculatedDiscount (itemSubtotalArray: ItemCharge[]): number {
  let discounts = 0
  for(let index = 0; index < itemSubtotalArray.length; index++)
  {
    discounts += itemSubtotalArray[index].discountedMoney
  }
  return discounts
}

function generateItemChargeArray(selectedTags: Map<string, number>): ItemCharge[] {
  const itemChargeArray: ItemCharge[] = []
  selectedTags.forEach((value, key) => {
    const itemCharge = new ItemCharge(key, 0, false, 0)
    itemChargeArray.push(itemCharge)
  })
  return itemChargeArray
}

function isItemInPromotion(selectedItemCharge: ItemCharge[]): ItemCharge[]{
  let updateItemChargeArray = selectedItemCharge
  const promotions = loadPromotions()
  updateItemChargeArray = selectedItemCharge.map(item => {
    if (promotions[0].barcode.includes(item.barcode))
    {
      item.isInPromotion = true
    }
    return item
  })
  return updateItemChargeArray
}

function getSubtotal(updatedItemCharge: ItemCharge[],
  idWithAmount: Map<string, number>): ItemCharge[]
{
  let itemSubtotalArray =  updatedItemCharge
  const itemInfos = loadAllItems()
  itemSubtotalArray = updatedItemCharge.map(item => {
    const barcode = item.barcode
    const itemInfo = itemInfos.filter(itemIn => itemIn.barcode === barcode)
    const amount = idWithAmount.get(barcode)!
    let discountedMoney = 0
    if (item.isInPromotion)
    {
      const discountedAmount = Math.floor(amount/3)
      discountedMoney = discountedAmount * itemInfo[0].price
    }
    const subtotal = amount * itemInfo[0].price - discountedMoney
    item.subtotal = subtotal
    item.discountedMoney = discountedMoney
    return item
  })
  return itemSubtotalArray
}

// function getItemByID (IdWithAmount: Map<string, number>): object[]
// {
//   const allItems = loadAllItems()
//   const selectedItems: object[] = []
//   IdWithAmount.forEach((value, key) => {
//     allItems.map(item => {
//       if (key === item.barcode)
//       {
//         selectedItems.push(item)
//       }
//     })
//   })
//   return selectedItems
// }

function processInput(tags:string[]): Map<string, number> {
  const selectedItems = new Map()
  tags.map(tag => {
    if (tag.includes('-'))
    {
      const tagTemporary = tag.split('-')[0]
      const amount = Number.parseFloat(tag.split('-')[1])
      if (selectedItems.has(tagTemporary))
      {
        let updateAmount = selectedItems.get(tagTemporary)
        updateAmount += amount
        selectedItems.set(tagTemporary,updateAmount)
      }
      else
      {
        selectedItems.set(tagTemporary,amount)
      }
    }
    else
    {
      if (selectedItems.has(tag))
      {
        let updateAmount = selectedItems.get(tag)
        updateAmount += 1
        selectedItems.set(tag,updateAmount)
      }
      else
      {
        selectedItems.set(tag, 1)
      }
    }
  })
  return selectedItems
}
