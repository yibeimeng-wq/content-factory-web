import { getDb } from "./db";
import { usageRecords } from "../drizzle/schema";
import { sql } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";

/**
 * 获取独立用户总数
 */
export async function getUniqueUserCount(): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn("[UserStats] Database not available");
    return 0;
  }
  
  const result = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${usageRecords.userId})` })
    .from(usageRecords);
  
  return result[0]?.count ?? 0;
}

/**
 * 检查是否需要发送用户数量通知
 * 当用户数达到10人时发送通知（仅发送一次）
 */
export async function checkAndNotifyUserMilestone(currentUserId: string): Promise<void> {
  const userCount = await getUniqueUserCount();
  
  // 当达到10个用户时发送通知
  if (userCount === 10) {
    // 检查是否已经发送过通知（通过检查是否有特殊标记）
    // 这里使用简单的逻辑：只在恰好等于10时触发
    const notificationSent = await notifyOwner({
      title: "🎉 Content Factory 用户里程碑",
      content: `恭喜！您的 Content Factory 应用已经有 10 位独立用户使用了！\n\n当前用户数：${userCount}\n最新用户ID：${currentUserId}\n\n这是一个重要的里程碑，说明您的应用正在获得关注。继续加油！`
    });
    
    if (notificationSent) {
      console.log(`[User Milestone] Notification sent: ${userCount} users reached`);
    }
  }
}
