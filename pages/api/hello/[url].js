export default function handler(req, res) {
  let url = req.query.url;
  const businessCardURL = `https://yzzrsmaxlukpahicprzp.supabase.co/storage/v1/object/public/cards/${url}.jpeg`;

  console.log(businessCardURL);
  res.status(200).json({ name: { businessCardURL } });
}
