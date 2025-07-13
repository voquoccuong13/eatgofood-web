const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const Product = require('../models/productModel');
const stringSimilarity = require('string-similarity');

const genAI = new GoogleGenerativeAI(process.env.API_KEY_GEMINI);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const MAIN_CATEGORIES = ['burger', 'pizza', 'chicken', 'gà', 'thức uống', 'nước', 'tráng miệng', 'dessert', 'combo'];
const CATEGORIES = ['bò', 'gà', 'cá', 'heo', 'chay', 'kem', 'bánh', 'chè', 'sinh tố', 'nước ép', 'trà sữa'];

const normalizeText = (str) =>
    str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^\w\s]/g, '')
        .trim();

function extractKeywords(text) {
    const rawStopWords = [
        'có',
        'ko',
        'không',
        'cho',
        'mình',
        'muốn',
        'ăn',
        'uống',
        'xin',
        'với',
        'là',
        'giá',
        'bao',
        'nhiêu',
        'còn',
        'tôi',
        'em',
        'anh',
        'chị',
        '?',
        'món',
        'nào',
    ];
    const stopWords = rawStopWords.map(normalizeText);
    return normalizeText(text)
        .split(/\s+/)
        .filter((word) => word && !stopWords.includes(word));
}

const MAIN_CATEGORY_MAP = {
    burger: 'burger',
    pizza: 'pizza',
    combo: 'combo',
    nuoc: 'thức uống',
    drink: 'thức uống',
    dessert: 'tráng miệng',
    trangmieng: 'tráng miệng',
};

const CATEGORY_MAP = {
    bo: 'bò',
    ga: 'gà',
    ca: 'cá',
    tom: 'tôm',
    chay: 'chay',
    pho: 'phô mai',
    bacon: 'bacon',
};

function extractCategoriesFromKeywords(keywords) {
    const mainCategory = [],
        category = [];
    keywords.forEach((kw) => {
        const normalized = normalizeText(kw);
        if (MAIN_CATEGORY_MAP[normalized] && !mainCategory.includes(MAIN_CATEGORY_MAP[normalized])) {
            mainCategory.push(MAIN_CATEGORY_MAP[normalized]);
        }
        if (CATEGORY_MAP[normalized] && !category.includes(CATEGORY_MAP[normalized])) {
            category.push(CATEGORY_MAP[normalized]);
        }
    });
    return { mainCategory, category };
}

async function askQuestion(question) {
    try {
        const keywords = extractKeywords(question);
        const allProducts = await Product.find();
        const exactProduct = allProducts.find((p) => normalizeText(p.name) === normalizeText(question));

        if (exactProduct) {
            const suggestProduct = allProducts
                .filter(
                    (p) =>
                        p._id.toString() !== exactProduct._id.toString() &&
                        normalizeText(p.mainCategory) === normalizeText(exactProduct.mainCategory),
                )
                .slice(0, 3);

            const prompt = `Người dùng hỏi: "${question}"
Thông tin món chính:
- Tên: ${exactProduct.name}
- Mô tả: ${exactProduct.description || 'Không có mô tả'}
- Giá: ${exactProduct.price.toLocaleString('vi-VN')} VNĐ
${suggestProduct.length > 0 ? `Gợi ý thêm món: ${suggestProduct.map((p) => p.name).join(', ')}` : ''}
Hãy trả lời người dùng bằng tiếng Việt một cách tự nhiên, thân thiện.`;

            let reply = '';
            try {
                const result = await model.generateContent(prompt);
                reply = result.response.text();
            } catch {
                reply = `Đây là món bạn đang tìm: ${exactProduct.name} (${exactProduct.price.toLocaleString(
                    'vi-VN',
                )}đ).\n${exactProduct.description || 'Không có mô tả.'}`;
            }

            return {
                reply,
                mainProduct: exactProduct,
                suggestProduct,
                mainCategory: [normalizeText(exactProduct.mainCategory)],
                category: [normalizeText(exactProduct.category)],
            };
        }

        const { mainCategory, category } = extractCategoriesFromKeywords(keywords);
        const normalizedMainCategory = mainCategory.map(normalizeText);
        const normalizedCategory = category.map(normalizeText);

        const matchedProducts = allProducts.filter((p) => {
            const mc = normalizeText(p.mainCategory);
            const c = normalizeText(p.category);
            if (normalizedMainCategory.length && normalizedCategory.length) {
                return normalizedMainCategory.includes(mc) && normalizedCategory.includes(c);
            } else if (!normalizedMainCategory.length && normalizedCategory.length) {
                return normalizedCategory.includes(c);
            } else if (normalizedMainCategory.length && !normalizedCategory.length) {
                return normalizedMainCategory.includes(mc);
            }
            return false;
        });

        if (matchedProducts.length > 0) {
            if (matchedProducts.length === 1) {
                const mainProduct = matchedProducts[0];
                const suggestProduct = allProducts
                    .filter(
                        (p) =>
                            p._id.toString() !== mainProduct._id.toString() &&
                            normalizeText(p.mainCategory) === normalizeText(mainProduct.mainCategory),
                    )
                    .slice(0, 3);

                const prompt = `Người dùng hỏi: "${question}"
Thông tin món chính:
- Tên: ${mainProduct.name}
- Mô tả: ${mainProduct.description || 'Không có mô tả'}
- Giá: ${mainProduct.price.toLocaleString('vi-VN')} VNĐ
${suggestProduct.length > 0 ? `Gợi ý thêm món: ${suggestProduct.map((p) => p.name).join(', ')}` : ''}
Hãy trả lời người dùng bằng tiếng Việt một cách tự nhiên, thân thiện.`;

                let reply = '';
                try {
                    const result = await model.generateContent(prompt);
                    reply = result.response.text();
                } catch {
                    reply = `Đây là món bạn đang tìm: ${mainProduct.name} (${mainProduct.price.toLocaleString(
                        'vi-VN',
                    )}đ).\n${mainProduct.description || 'Không có mô tả.'}`;
                }

                return {
                    reply,
                    mainProduct,
                    suggestProduct,
                    mainCategory: normalizedMainCategory,
                    category: normalizedCategory,
                };
            }

            const productList = matchedProducts
                .map(
                    (p, i) =>
                        `🍔 Món ${i + 1}:
- Tên: ${p.name}
- Giá: ${p.price.toLocaleString('vi-VN')}đ
- Mô tả: ${p.description || 'Không có mô tả.'}
- Hình ảnh: ${p.image || 'Không có hình ảnh.'}`,
                )
                .join('\n\n');

            const reply = `Mình tìm thấy ${matchedProducts.length} món phù hợp với yêu cầu của bạn:\n\n${productList}`;

            return {
                reply,
                mainProduct: null,
                suggestProduct: matchedProducts,
                mainCategory: normalizedMainCategory,
                category: normalizedCategory,
            };
        }

        const productNames = allProducts.map((p) => normalizeText(p.name));
        const matchResult = stringSimilarity.findBestMatch(normalizeText(question), productNames);
        const bestMatchIndex = matchResult.bestMatchIndex;
        const bestMatchRating = matchResult.bestMatch.rating;

        if (bestMatchRating < 0.4) {
            return {
                reply: 'Xin lỗi, tôi chưa tìm thấy món nào phù hợp với yêu cầu của bạn.',
                mainProduct: null,
                suggestProduct: [],
                mainCategory: [],
                category: [],
            };
        }

        const mainProduct = allProducts[bestMatchIndex];
        const suggestProduct = allProducts
            .filter(
                (p) =>
                    p._id.toString() !== mainProduct._id.toString() &&
                    normalizeText(p.mainCategory) === normalizeText(mainProduct.mainCategory),
            )
            .slice(0, 3);

        const prompt = `Người dùng hỏi: "${question}"
Thông tin món chính:
- Tên: ${mainProduct.name}
- Mô tả: ${mainProduct.description || 'Không có mô tả'}
- Giá: ${mainProduct.price.toLocaleString('vi-VN')} VNĐ
${suggestProduct.length > 0 ? `Gợi ý thêm món: ${suggestProduct.map((p) => p.name).join(', ')}` : ''}
Hãy trả lời người dùng bằng tiếng Việt một cách tự nhiên, thân thiện.`;

        let reply = '';
        try {
            const result = await model.generateContent(prompt);
            reply = result.response.text();
        } catch {
            reply = `Đây là món bạn đang tìm: ${mainProduct.name} (${mainProduct.price.toLocaleString('vi-VN')}đ).\n${
                mainProduct.description || 'Không có mô tả.'
            }`;
        }

        return {
            reply,
            mainProduct,
            suggestProduct,
            mainCategory: [normalizeText(mainProduct.mainCategory)],
            category: [normalizeText(mainProduct.category)],
        };
    } catch (error) {
        console.error('❌ Lỗi xử lý chatbot:', error);
        return {
            reply: 'Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại sau.',
            mainProduct: null,
            suggestProduct: [],
            mainCategory: [],
            category: [],
        };
    }
}

module.exports = { askQuestion };
