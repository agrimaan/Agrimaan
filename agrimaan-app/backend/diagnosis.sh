# Is backend listening?
ss -tulpn | grep 3001

# Does the API respond?
curl -i http://localhost:3001/api/auth/register           # (should be 404 GET)
curl -i -X POST http://localhost:3001/api/auth/register   # (should be 200/201 etc.)

# From the frontend container/host?
curl -i http://localhost:3000/api/auth/register           # should proxy to 3001 (POST)

