
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "الطريقة غير مسموحة"
    });
  }

  try {
    const { message, history = [] } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "اكتب سؤالك أولاً"
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "مفتاح الذكاء الاصطناعي غير مضبوط"
      });
    }

    const messages = [
      {
        role: "system",
        content: "أنت ملك الهم، مساعد ذكاء اصطناعي عربي ذكي. اشرح المعلومات بوضوح وبأسلوب سهل، وساعد المستخدم في التعلم والبرمجة وحل المشكلات. أجب بلغة المستخدم."
      },
      ...history
        .filter(m =>
          ["user", "assistant"].includes(m.role) &&
          typeof m.content === "string"
        )
        .slice(-10),
      { role: "user", content: message }
    ];

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          messages,
          temperature: 0.7
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "حدث خطأ في الذكاء الاصطناعي"
      });
    }

    return res.status(200).json({
      reply: data.choices[0].message.content
    });

  } catch (error) {
    return res.status(500).json({
      error: "حدث خطأ أثناء الاتصال"
    });
  }
}
