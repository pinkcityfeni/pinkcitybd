## Save Communication Preference

User চাইছেন আমি সবসময় **বাংলা + ইংরেজি mixed (Banglish)** style এ কথা বলি। এটা একটা user-level preference, তাই `mem://~user` file এ save করব।

### What will be done:

1. **Update `mem://~user`** — User preference file এ communication style add করা হবে:
   - Technical terms (database, component, function, button, ইত্যাদি) English এ রাখা
   - Explanations ও instructions বাংলায় দেওয়া
   - Code, file names, variable names সবসময় English এ
   - Mixed Banglish tone maintain করা

### Why this approach:

- `mem://~user` file টা user-specific (project না), তাই অন্য সব project এও এই preference apply হবে
- Always-in-context থাকে, প্রতিটা response এ automatically apply হয়
- Project memory (Glamora design tokens, demo credentials) এর সাথে conflict করবে না

### No code changes:

এটা শুধু একটা memory/preference update — কোনো codebase file edit হবে না।
