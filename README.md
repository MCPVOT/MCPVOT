<h1 align="center">
  <a href="https://github.com/MCPVOT">
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=32&duration=3000&pause=1000&color=00FF88&center=true&vCenter=true&multiline=false&repeat=true&width=600&height=55&lines=MCPVOT;Multi‑Model+Consensus+AI;x402+Agent+Payments;Real+Estate+%7C+Blockchain" alt="Typing SVG" />
  </a>
</h1>

<p align="center">
  <em>Infrastructure for AI agents that pay each other — on‑chain, with multi‑model consensus.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Building-00ff88?style=flat-square&labelColor=0d1117" />
  <img src="https://img.shields.io/badge/Location-Colombia-f5b800?style=flat-square&labelColor=0d1117" />
  <img src="https://img.shields.io/badge/Chain-Base-0052FF?style=flat-square&logo=base&labelColor=0d1117" />
  <img src="https://img.shields.io/badge/x402-Facilitator_V2-FF6B35?style=flat-square&labelColor=0d1117" />
  <img src="https://img.shields.io/badge/ENS-mcpvot.eth-5298FF?style=flat-square&labelColor=0d1117" />
  <img src="https://komarev.com/ghpvc/?username=MCPVOT&style=flat-square&color=00ff88&label=Views" alt="Profile views" />
</p>

---

## ❓ What is MCPVOT?

**MCPVOT is a consensus engine for AI agents.** Instead of trusting a single LLM for critical tasks — generating rental contracts, executing on‑chain trades, or verifying legal clauses — MCPVOT queries **multiple models simultaneously** and uses a weighted voting protocol to select the most reliable answer. Wrong answers are filtered out. The result is safer, auditable, and production‑grade.

We also built **x402**, an open protocol that lets AI agents pay each other using USDC and HTTP‑402. Agents can charge for API access, premium inference, or verified data, all settled on Base.

**The four pillars:**
- 🥑 **Pequi** — AI real estate for Colombia (Ley 820 contracts, property search, Wompi payments)
- 🧠 **MCPVotsAGI** — Agent orchestration with persistent memory and Darwin‑Gödel evolution
- 💰 **MCPVOTS** — On‑chain micro‑payment ecosystem (VOTS token, autonomous traders)
- 🔌 **Claude Agent MCP** — Personal AI agent with cross‑platform MCP integration

---

## 🏗️ Architecture

```mermaid
graph TD
    USER[User / DApp] --> PEQUI[Pequi ‑ Real Estate]
    USER --> MCPVOTS[MCPVOTS ‑ Token Ecosystem]
    PEQUI --> Wompi[Wompi Payments]
    PEQUI --> Clerk[Clerk Auth]
    MCPVOTS --> Base[Base L2]
    MCPVOTS --> x402[x402 Protocol]
    x402 --> AGI[MCPVotsAGI ‑ Agent Orchestration]
    AGI --> DeepSeek[DeepSeek V4]
    AGI --> Claude[Claude Opus]
    AGI --> Qwen[Qwen 3.6]
    AGI --> Memory[Persistent Memory / Redis]
