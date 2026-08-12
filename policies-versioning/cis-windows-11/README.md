# CIS — Windows 11 (Intune)

Placeholder for **CIS Microsoft Intune for Windows 11** policies (Level 1 / Level 2).

## How to add

1. Export or author each setting as an Intune policy JSON.
2. Place under the matching type folder (usually `settings-catalog` or `device-configuration-policies`):

```
cis-windows-11/
  settings-catalog/
    [CIS][L1] <Setting title>/
      1.0.0_[CIS][L1] <Setting title>.json
      policy.metadata.json
```

3. Tag metadata with at least `cis`, `windows-11`, and `l1` or `l2`.

Do not commit entire third-party CIS benchmark dumps without review—prefer curated, tested subsets.