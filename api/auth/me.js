export default function handler(req, res) {
  const cookie = req.headers.cookie || "";
  const match = cookie.match(/user=([^;]+)/);

  if (!match) return res.status(200).json({ loggedIn: false });

  const user = JSON.parse(decodeURIComponent(match[1]));
  res.status(200).json({ loggedIn: true, user });
}
