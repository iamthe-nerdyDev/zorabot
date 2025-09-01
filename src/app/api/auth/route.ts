import { NextRequest, NextResponse } from 'next/server';

// -- logout
export async function DELETE(req: NextRequest) {
  const identifier = req.cookies.get('identifier')?.value;
  if (!identifier) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = req.cookies.delete('identifier');
  return NextResponse.json({ data });
}
