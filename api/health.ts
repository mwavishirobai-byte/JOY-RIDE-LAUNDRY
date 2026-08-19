export default function handler(_req: any, res: any) {
  res.status(200).json({
    success: true,
    status: 'ok',
    business: 'Joy and Ride Laundry',
    time: new Date().toISOString(),
  });
}
