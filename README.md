# JavaScript Deobfuscation: A Case Study

## Executive Summary

This project demonstrates a complete reverse engineering workflow used to analyze a heavily obfuscated browser extension. The goal was to transform a "self-defending" and unreadable codebase into a clean, human-readable source for security auditing.

The analysis involved structural deobfuscation, dynamic string recovery, and semantic reconstruction using custom Node.js tooling.

## Technical Challenge

The source code employed several advanced obfuscation techniques:

1. **String Array Mapping**: All sensitive strings (APIs, property names, URLs) were replaced by numeric pointers to a dynamic dictionary.
2. **Self-Defending Mechanisms**: The code included "anti-tamper" traps designed to break standard beautifiers and parsers (e.g., assigning values to function calls `func() = value`).
3. **Control Flow Flattening**: The logical flow was scrambled to prevent static analysis.
4. **Bitwise Transformation**: The string dictionary was encoded using bit-shifting operations calculated at runtime.

## Deobfuscation Workflow

### Step 1: Structural Analysis

I initially used **webcrack** to perform an AST-based transformation. This step successfully:

* Resolved simple constant folding.
* Separated bundled modules.
* Un-minified the basic structure.

*Result*: The code was structured but still semantically void, as all logic relied on an array named `$1`.

### Step 2: Dynamic String Recovery

The extension used a complex function to decrypt its internal dictionary. Instead of manual translation, I developed a **sandbox extraction script** (`extract_strings.js`).

* **Method**: I extracted the bitwise decryption logic and the raw numeric data.
* **Execution**: By running this logic in a controlled Node.js environment, I generated a mapping of over 1,700 unique strings.

### Step 3: Neutralizing Anti-Tamper Traps

The code contained syntax-breaking "traps" to prevent formatting. I used **regex-based filtering** via `sed` to identify and comment out invalid assignment expressions like `oqQoY() ^= sCzbF;`. This allowed the code to be processed by standard linters and formatters.

### Step 4: Semantic Reconstruction

I authored a final reconstruction engine (`rebuild.js`) to:

1. Map the recovered strings back into the AST.
2. Perform **string concatenation merging** (e.g., transforming `"chr" + "ome"` into `"chrome"`).
3. Replace bracket-notation obfuscation with standard dot-notation for API calls.

## Results & Findings

The final output provided a clear view of the extension's behavior:

* **PII Data Mining**: Identified logic designed to extract Personally Identifiable Information (PII) including emails, phone numbers, and birth dates.
* **Session Hijacking**: Found specialized hooks to capture auth tokens and session cookies (accessToken, auth_id), allowing for unauthorized account access.
* **Stealth Exfiltration**: Revealed a Command & Control (C2) architecture where captured data was encrypted using AES-GCM before being sent to a remote server

## Tools Used

* **Linux/Bash**: Stream processing with `sed`, `grep`, and `find`.
* **Node.js**: Custom scripts for AST manipulation and dictionary recovery.
* **Webcrack**: Initial de-bundling.
* **Prettier**: Final code normalization.
