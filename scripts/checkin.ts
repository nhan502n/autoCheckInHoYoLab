// scripts/checkin.ts
import { TOKEN_1, TOKEN_2, DISCORD_WEBHOOK } from "@env";

const urlDict: Record<string, string> = {
  Genshin: "https://sg-hk4e-api.hoyolab.com/event/sol/sign?lang=en-us&act_id=e202102251931481",
  Star_Rail: "https://sg-public-api.hoyolab.com/event/luna/os/sign?lang=en-us&act_id=e202303301540311",
  Honkai_3: "https://sg-public-api.hoyolab.com/event/mani/sign?lang=en-us&act_id=e202110291205111",
  Tears_of_Themis: "https://sg-public-api.hoyolab.com/event/luna/os/sign?lang=en-us&act_id=e202308141137581",
  Zenless_Zone_Zero: "https://sg-act-nap-api.hoyolab.com/event/luna/zzz/os/sign?lang=en-us&act_id=e202406031448091",
};

interface Profile {
  token: string;
  games: string[];
  accountName: string;
}

const profiles: Profile[] = [
  {
    token: TOKEN_1,
    games: ["Star_Rail", "Zenless_Zone_Zero"],
    accountName: "ZZZ",
  },
  {
    token: TOKEN_2,
    games: ["Star_Rail"],
    accountName: "HSR",
  },
];

function discordPing(): string {
  return "<@nhan502> ";
}

async function postWebhook(content: string) {
  if (!DISCORD_WEBHOOK) return;
  try {
    await fetch(DISCORD_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "auto-sign",
        avatar_url: "https://i.imgur.com/LI1D4hP.png",
        content,
      }),
    });
  } catch (e) {
    console.log("Webhook failed");
  }
}

export async function checkIn(): Promise<string> {
  const results: string[] = [];

  for (const profile of profiles) {
    let response = `Check-in completed for ${profile.accountName}`;

    for (const game of profile.games) {
      const url = urlDict[game as keyof typeof urlDict];
      const isZZZ = url.includes("zzz");
      const isHSR = url.includes("hkrpg");

      const headers: Record<string, string> = {
        Cookie: profile.token,
        Accept: "application/json, text/plain, */*",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
        "x-rpc-client_type": isZZZ || isHSR ? "5" : "4",
        "x-rpc-app_version": "2.34.1",
        "x-rpc-platform": "4",
        Referer: "https://act.hoyolab.com/",
        Origin: "https://act.hoyolab.com",
        ...(isZZZ || isHSR
          ? {
              "x-rpc-device_id": "a1d727a9d9dfb96607c85f0941f9f6e6_0.7466653091675239",
              "x-rpc-device_fp": "a1d727a9d9dfb96607c85f0941f9f6e6_0.7466653091675239",
              "x-rpc-signgame": isZZZ ? "zzz" : "hkrpg",
            }
          : {}),
      };

      try {
        await new Promise((r) => setTimeout(r, 1000));
        const res = await fetch(url, { method: "POST", headers });
        const json = await res.json();
        const bannedCheck = json?.data?.gt_result?.is_risk;

        if (bannedCheck) {
          response += `\n${game.replace(/_/g, " ")}: ${discordPing()}Bị CAPTCHA chặn.`;
        } else {
          response += `\n${game.replace(/_/g, " ")}: ${json.message !== "OK" ? discordPing() : ""}${json.message}`;
        }
      } catch (err) {
        response += `\n${game.replace(/_/g, " ")}: Request failed.`;
      }
    }

    results.push(response);
  }

  const final = results.join("\n\n");
  await postWebhook(final);
  return final;
}