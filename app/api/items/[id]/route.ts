import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import type { Item } from "@/types"

const dataFilePath = path.join(process.cwd(), "data", "quote.json")

async function readData(): Promise<{ items: Item[] }> {
  const data = await fs.readFile(dataFilePath, "utf-8")
  return JSON.parse(data)
}

async function writeData(data: { items: Item[] }): Promise<void> {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2))
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = params.id
  const updatedItem: Item = await request.json()
  const data = await readData()

  const index = data.items.findIndex((item) => item.id === id)
  if (index === -1) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 })
  }

  // Check for duplicate item names, excluding the current item
  if (data.items.some((item) => item.name === updatedItem.name && item.id !== id)) {
    return NextResponse.json({ error: "An item with this name already exists" }, { status: 400 })
  }

  data.items[index] = { ...updatedItem, id }
  await writeData(data)
  return NextResponse.json(data.items[index])
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = params.id
  const data = await readData()

  const index = data.items.findIndex((item) => item.id === id)
  if (index === -1) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 })
  }

  data.items.splice(index, 1)
  await writeData(data)
  return NextResponse.json({ message: "Item deleted successfully" })
}

