import { getChat } from "../clients/OpenAPIClient";

export interface ArticleValidationResult {
    isValid: boolean;
    issues: string[];
    suggestions: string[];
    score: number; // 0-100
}

export class ArticleValidationService {
    private static readonly VALIDATION_INSTRUCTIONS = `
        You are an article quality validator for fantasy football content.
        Analyze the provided article and return a JSON response with the following structure:
        {
            "isValid": boolean,
            "issues": string[],
            "suggestions": string[],
            "score": number (0-100)
        }
        
        Validation Criteria:
        1. Structure: Does it follow the required markdown format with proper headers (##)?
        2. Completeness: Does it cover all matchups mentioned in the data?
        3. Statistical Content: Does it include relevant stats and projections?
        4. Character Limit: Is it under 7000 characters?
        5. Manager Quotes: Does it include manager quotes for each matchup?
        6. Predictions: Does it include clear winner predictions?
        7. Playoff Context: Does it mention playoff implications?
        8. Professional Tone: Is the tone serious and professional?
        
        Score Guidelines:
        - 90-100: Excellent, meets all criteria
        - 80-89: Good, minor issues
        - 70-79: Acceptable, some issues
        - 60-69: Needs improvement
        - Below 60: Significant issues
    `;

    public static async validateArticle(article: string, articleType: "pre" | "post"): Promise<ArticleValidationResult> {
        try {
            const validationPrompt = `
                Article Type: ${articleType === "pre" ? "Pre-matchup Preview" : "Post-matchup Recap"}
                Article Content:
                ${article}
                
                Please validate this article according to the criteria above.
            `;

            const response = await getChat(validationPrompt, this.VALIDATION_INSTRUCTIONS);
            
            if (!response || !response.choices || !response.choices[0]) {
                return {
                    isValid: false,
                    issues: ["Failed to get validation response"],
                    suggestions: ["Try regenerating the article"],
                    score: 0
                };
            }

            const validationContent = response.choices[0].message.content;
            
            try {
                const validationResult = JSON.parse(validationContent);
                return validationResult as ArticleValidationResult;
            } catch (parseError) {
                // Fallback validation if JSON parsing fails
                return this.fallbackValidation(article, articleType);
            }
        } catch (error) {
            console.error("Article validation error:", error);
            return this.fallbackValidation(article, articleType);
        }
    }

    private static fallbackValidation(article: string, articleType: "pre" | "post"): ArticleValidationResult {
        const issues: string[] = [];
        const suggestions: string[] = [];
        let score = 100;

        // Check character limit
        if (article.length > 7000) {
            issues.push(`Article exceeds character limit: ${article.length}/7000`);
            score -= 20;
        }

        // Check for required headers
        const headerCount = (article.match(/^## /gm) || []).length;
        if (headerCount === 0) {
            issues.push("Missing matchup headers (##)");
            score -= 15;
        }

        // Check for manager quotes
        const quoteCount = (article.match(/\*.*\*/g) || []).length;
        if (quoteCount === 0) {
            issues.push("Missing manager quotes");
            score -= 10;
        }

        // Check for predictions
        const predictionKeywords = ["winner", "prediction", "projected", "will win"];
        const hasPrediction = predictionKeywords.some(keyword => 
            article.toLowerCase().includes(keyword)
        );
        if (!hasPrediction) {
            issues.push("Missing winner predictions");
            score -= 10;
        }

        // Check for playoff context
        const playoffKeywords = ["playoff", "pink", "standing"];
        const hasPlayoffContext = playoffKeywords.some(keyword => 
            article.toLowerCase().includes(keyword)
        );
        if (!hasPlayoffContext) {
            issues.push("Missing playoff implications");
            score -= 10;
        }

        // Check for statistical content
        const statKeywords = ["points", "record", "wins", "losses", "stats"];
        const hasStats = statKeywords.some(keyword => 
            article.toLowerCase().includes(keyword)
        );
        if (!hasStats) {
            issues.push("Limited statistical content");
            score -= 15;
        }

        return {
            isValid: score >= 70,
            issues,
            suggestions: [
                "Ensure all matchups are covered",
                "Include manager quotes for each matchup",
                "Add clear winner predictions",
                "Mention playoff implications",
                "Include relevant statistics"
            ],
            score: Math.max(0, score)
        };
    }

    public static async regenerateArticleIfNeeded(
        originalArticle: string, 
        articleType: "pre" | "post",
        maxAttempts: number = 3
    ): Promise<string> {
        let currentArticle = originalArticle;
        let attempts = 0;

        while (attempts < maxAttempts) {
            const validation = await this.validateArticle(currentArticle, articleType);
            
            if (validation.isValid && validation.score >= 80) {
                return currentArticle;
            }

            attempts++;
            console.log(`Article validation failed (attempt ${attempts}/${maxAttempts}). Score: ${validation.score}`);
            console.log("Issues:", validation.issues);
            
            // For now, return the original article
            // In a full implementation, you would regenerate here
            if (attempts >= maxAttempts) {
                console.log("Max regeneration attempts reached. Using original article.");
                return originalArticle;
            }
        }

        return currentArticle;
    }
}