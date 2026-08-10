# gle-intune

Intune policy definitions for **Nerdio Manager for MSP** GitHub sync.

## Layout

```
policies-versioning/
  <category>/
    <Policy Display Name>/
      1.0.0_<Policy Display Name>.json
      policy.metadata.json
```

## Link in Nerdio Manager

1. MSP level → **System** → **Integrations** → **GitHub Repositories** → **Link Repository**
2. Account: `Brandon-Nerdio`
3. Repository: `gle-intune`
4. Path: `/policies-versioning`
5. Branch: `main`
6. File extensions: `.json`
7. File content: **Intune Policies Versioning** (or Intune device configuration policy)
8. Include subfolders: on
9. Auto-synchronization: on (or refresh manually after pushes)
