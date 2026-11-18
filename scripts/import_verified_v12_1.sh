#!/usr/bin/env bash
set -euo pipefail
# Fixed, SHA-256-verified copy of the publicly deployed v12.1 static demo.
# Never fetch unknown files or overwrite root of the repository.
BASE='https://neon-frangipane-3e6ab2.netlify.app'
OUT='snapshots/v12.1'
mkdir -p "$OUT/tests"
while read -r checksum name; do
  [[ -z "$checksum" || "$checksum" == '#' ]] && continue
  curl --fail --location --silent --show-error --retry 2 "$BASE/$name" -o "$OUT/$name"
  printf '%s  %s\n' "$checksum" "$OUT/$name" | sha256sum --check --status || {
    echo "Checksum mismatch: $name. Release NOT imported."; exit 1;
  }
done <<'MANIFEST'
8bc4c5e7eaff1b576102e3daeaf0eb16fb61bd0a1d9c141ea53faed82e119725 README.md
d27fd051c997665dea6409fb531913a2a02ae6169bc403bf6096e6432514d32b ai-cpu-worker.js
1dffefa0e0d91ca0ea2300f57fed344110b7c8a3ccd89cf316fa00bded98a964 ai-cpu.html
05e38a7e7ffb318d1e6b644582da18f4e6a650c4bbb800f36106d98f70a54fa2 ai-lab.html
f13dab3150ba9c046b2f7b82b949e8ba58defcf07af53a42453c5155dcaf196b app.js
4b88ebd970fa9b70413df1b922a5a290701973999dbd9daf7677233a7c7056eb core.js
67ff0b5d28579339b77febb36d8efaa1cc057fa41d31a212d2fca64045841b47 demo-salon.html
d5b7b21aefbc085d1e254443b5a63b5e38d4a5b991700e79677c4791af3c4da1 index.html
8203cb4d97b029599ea64c7ee36466fc884f78f7101c1c917bd6c2d5f692ddbd published-profile.json
66242c835fea417418b50608f8d0416aca0dd5d4ab8f296f8bb27672b92bbc7b salon-facts.js
008eec0107036716f76bb25c95114403d884e8ddf8d77b7bed299c9b2b2f987f store.js
61c85579bcdf60f8c99b178769de367d96bb9e8675ef25258fc2a5a548c77a87 studio.html
9db66dc8219ef959225303a5374a3a2cd3d5d258c9f56d0fe36dab84a033a24d studio.js
8e1218103b06cea62cdd24826a0d68cb4e9aff84d76f6d1cf0efac2861064cb6 tests/test-core.js
8d2c9706f4e78f8a5c61c39c04a64851f501013b6b72fa8ffc242ddfd7c5993b tests/test-store.js
419927851dfdc8ef4457eab5293214ea0e5a17b54b34f242925229d883f632f4 theme.css
MANIFEST
echo 'Verified v12.1 snapshot copied under snapshots/v12.1/'
