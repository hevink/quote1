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

export async function GET() {
  const data = await readData()
  return NextResponse.json(data.items)
}

export async function POST(request: Request) {
  const item: Item = await request.json()
  const data = await readData()

  // Check for duplicate item names
  if (data.items.some((existingItem) => existingItem.name === item.name)) {
    return NextResponse.json({ error: "An item with this name already exists" }, { status: 400 })
  }

  data.items.push(item)
  await writeData(data)
  return NextResponse.json(item, { status: 201 })
}

