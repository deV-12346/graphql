const URL = "http://localhost:4000/api/auth/place-order";

const requests = [
  { product_id: 1, address_id: 14, user_id: 1 },
  { product_id: 1, address_id: 4, user_id: 2 },
];

const placeOrder = (body, i) =>
  fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
  .then(async (r) => console.log(`Request ${i + 1}:`, r.status, await r.text()));

await Promise.all(requests.map(placeOrder));