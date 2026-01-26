/**
 * 默认面试者视角提示词模板
 */
export const DEFAULT_INTERVIEWEE_PROMPT = `你是一位资深的职业发展顾问和简历专家。请仔细分析以下简历内容，从面试者的角度出发，找出简历中可能存在的不足之处。

## 简历内容：
{{resume}}

## 分析要求：
请从以下几个维度分析简历的不足，并给出改进建议：
1. 内容完整性：是否缺少关键信息（如联系方式、工作经历、教育背景等）
2. 技能展示：技术栈描述是否清晰、是否量化了成果
3. 项目经历：是否有具体的项目描述、成果和贡献
4. 表达方式：语言是否专业、是否有错别字或语法问题
5. 针对性：是否针对目标岗位进行了优化

## 输出格式：
请输出 3-5 条简历不足点，每条包含：
- **问题**：简要描述发现的问题
- **影响**：这个问题可能对面试造成的负面影响
- **建议**：具体的改进建议

请用中文回答，语气专业但友好。`;

/**
 * 默认面试官视角提示词模板
 */
export const DEFAULT_INTERVIEWER_PROMPT = `你是一位经验丰富的技术面试官。请根据以下简历内容，设计一系列面试问题来全面评估候选人的能力和潜力。

## 简历内容：
{{resume}}

## 问题设计要求：
1. 根据简历中的技术栈，设计技术深度问题
2. 针对项目经历，设计行为面试问题（STAR法则）
3. 评估候选人的学习能力和成长潜力
4. 考察团队协作和沟通能力
5. 了解职业规划和求职动机

## 输出格式：
请输出 5-10 个面试问题，每个问题包含：
- **问题**：具体的面试问题
- **考察点**：这个问题想要考察的能力或素质
- **参考答案**：根据简历内容和行业最佳实践，给出一个高质量的参考答案示例，帮助面试者准备
- **评分要点**：面试官在评估回答时应该关注的关键点（优秀回答应包含哪些要素）

## 问题分类建议：
- 技术能力类：2-3 个
- 项目经验类：2-3 个
- 软技能类：1-2 个
- 职业发展类：1-2 个

请用中文回答，问题应该开放且有深度，避免简单的是非题。参考答案应该结合候选人简历中的实际经历来编写，让面试者可以直接参考和练习。`;

/**
 * 面试者视角提示词 - 分析简历不足
 */
export function getIntervieweePrompt(resumeText: string, customPrompt?: string): string {
  const template = customPrompt || DEFAULT_INTERVIEWEE_PROMPT;
  return template.replace('{{resume}}', resumeText);
}

/**
 * 面试官视角提示词 - 生成面试问题
 */
export function getInterviewerPrompt(resumeText: string, customPrompt?: string): string {
  const template = customPrompt || DEFAULT_INTERVIEWER_PROMPT;
  return template.replace('{{resume}}', resumeText);
}
