#!/bin/sh
set -eu

repo=${1:-../zig}
base_url=${BASE_URL:-https://codeberg.org/ziglang/zig}
commit_limit=${COMMIT_LIMIT:-1000}
file_limit=${FILE_LIMIT:-8}
commit_sha=${COMMIT_SHA:-}

is_prish_subject() {
  case $1 in
  *'(#'* | *'Merge pull request '*)
    return 0
    ;;
  esac

  return 1
}

encode_path_segments() {
  node -e 'const path = process.argv[1]; process.stdout.write(path.split("/").map(encodeURIComponent).join("/"));' "$1"
}

extract_candidate_from_blame() {
  sha=$1
  file=$2

  # Forgejo's blame page shows the forward blame result for the commit itself.
  git -C "$repo" blame --line-porcelain "$sha" -- "$file" 2>/dev/null |
    awk -v sha="$sha" -v file="$file" '
      BEGIN {
        matched = 0;
        saw_previous = 0;
        line = "";
        previous_sha = "";
        previous_path = "";
      }
      /^[0-9a-f]{40} [0-9]+ [0-9]+ [0-9]+$/ {
        matched = ($1 == sha);
        if (matched) {
          line = $3;
          saw_previous = 0;
          previous_sha = "";
          previous_path = "";
        }
        next;
      }
      /^previous / {
        if (matched) {
          previous_sha = $2;
          previous_path = substr($0, index($0, $3));
          saw_previous = (previous_path == file);
        }
        next;
      }
      /^\t/ {
        if (matched && saw_previous) {
          print line "\t" previous_sha "\t" previous_path;
          exit 0;
        }
      }
    '
}

find_example_for_commit() {
  sha=$1
  subject=$2
  files=$(git -C "$repo" diff-tree --no-commit-id --name-only -r "$sha^1" "$sha" | head -n "$file_limit")
  old_ifs=$IFS
  IFS='
'

  for file in $files; do
    candidate=$(extract_candidate_from_blame "$sha" "$file" || true)
    if [ -n "$candidate" ]; then
      IFS="$old_ifs"
      line=$(printf '%s\n' "$candidate" | cut -f1)
      previous_sha=$(printf '%s\n' "$candidate" | cut -f2)
      previous_path=$(printf '%s\n' "$candidate" | cut -f3)
      encoded_file=$(encode_path_segments "$file")
      url=$base_url/blame/commit/$sha/$encoded_file#L$line
      printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\n' "$sha" "$subject" "$file" "$line" "$previous_sha" "$previous_path" "$url"
      return 0
    fi
  done

  IFS="$old_ifs"
  return 1
}

search_commits() {
  if [ -n "$commit_sha" ]; then
    subject=$(git -C "$repo" show -s --format=%s "$commit_sha")
    find_example_for_commit "$(git -C "$repo" rev-parse "$commit_sha")" "$subject"
    return $?
  fi

  for sha in $(git -C "$repo" rev-list --first-parent --max-count="$commit_limit" HEAD); do
    subject=$(git -C "$repo" show -s --format=%s "$sha")
    if ! is_prish_subject "$subject"; then
      continue
    fi

    if find_example_for_commit "$sha" "$subject"; then
      return 0
    fi
  done

  return 1
}

if ! search_commits; then
  printf 'no candidate found\n'
  exit 1
fi
