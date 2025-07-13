require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/productModel");
const { connectDB } = require("./config/db");
const data = [
  {
    name: "Burger bò đặc biệt",
    image: "/uploads/assets/Burger_1.jpg",
    price: 75000,
    description: "Burger bò Mỹ với phô mai cheddar và rau củ tươi.",
    category: "Beef",
    mainCategory: "Burger",
  },
  {
    name: "Pizza hải sản",
    image: "/uploads/assets/Pizza_6.jpg",
    price: 120000,
    description: "Pizza topping hải sản tươi ngon, phô mai Mozzarella.",
    category: "Seafood",
    mainCategory: "Pizza",
  },

  {
    name: "Burger Bò phô mai đặc biệt",
    image: "/uploads/assets/Burger_2.jpg",
    price: 56000,
    description: "Patty Bò, phô mai, sốt đặc biệt, rau tươi",
    category: "Bò",
    mainCategory: "Burger",
  },
  {
    name: "Burger 2 lớp Bò, phô mai",
    image: "/uploads/assets/Burger_3.jpg",
    price: 66000,
    description: "2 Patty bò Mỹ, Double phô mai Cheddar, Xà lách",
    category: "Bò",
    mainCategory: "Burger",
  },
  {
    name: "Burger Bò miếng lớn phô mai",
    image: "/uploads/assets/Burger_4.jpg",
    price: 79000,
    description:
      "Patty bò Mỹ nguyên miếng lớn, lát phô mai Cheddar to bản, Xà lách crisp",
    category: "Bò",
    mainCategory: "Burger",
  },
  {
    name: "Burger Big Mac",
    image: "/uploads/assets/Burger_5.jpg",
    price: 76000,
    description: "2 Patty Bò Mỹ, Xúc xích, Xà lách bào sợi",
    category: "Bò",
    mainCategory: "Burger",
  },
  {
    name: "Burger Bò hoàng gia đặc biệt",
    image: "/uploads/assets/Burger_6.jpg",
    price: 89000,
    description: "Patty bò Mỹ cao cấp, Lát phô mai Cheddar & Swiss mix",
    category: "Bò",
    mainCategory: "Burger",
  },
  {
    name: "Burger Gà phô mai đặc biệt",
    image: "/uploads/assets/Burger_7.jpg",
    price: 69000,
    description:
      "Ức gà tẩm bột chiên giòn, Lát phô mai Mozzarella & Cheddar mix",
    category: "Gà",
    mainCategory: "Burger",
  },
  {
    name: "Burger Gà nhỏ Mayo",
    image: "/uploads/assets/Burger_8.jpg",
    price: 36000,
    description: "Ức gà chiên giòn cỡ nhỏ, Sốt mayonnaise đặc biệt",
    category: "Gà",
    mainCategory: "Burger",
  },
  {
    name: "Burger Gà thượng hạng giòn cay",
    image: "/uploads/assets/Burger_9.jpg",
    price: 99000,
    description: "Ức gà tẩm bột chiên giòn, ướp sốt cay đặc biệt",
    category: "Gà",
    mainCategory: "Burger",
  },
  {
    name: "Burger phi lê Cá phô mai",
    image: "/uploads/assets/Burger_10.jpg",
    price: 56000,
    description: "Phi lê cá basa, Lát phô mai Swiss, Xà lách crisp",
    category: "Cá",
    mainCategory: "Burger",
  },
  {
    name: "Burger xúc xích",
    image: "/uploads/assets/Burger_11.jpg",
    price: 36000,
    description: "Xúc xích, Lát phô mai Cheddar, Xà lách crisp",
    category: "Xúc xích",
    mainCategory: "Burger",
  },
  {
    name: "Burger Gà Sốt Teriyaki",
    image: "/uploads/assets/Burger_12.jpg",
    price: 105000,
    description: "Phô mai Mozzarella, xà lách, sốt teriyaki, mè rang",
    category: "Gà",
    mainCategory: "Burger",
  },
  {
    name: "Burger Cá Giòn",
    image: "/uploads/assets/Burger_13.jpg",
    price: 105000,
    description: "Phô mai Swiss, xà lách, dưa leo, sốt tartar",
    category: "Cá",
    mainCategory: "Burger",
  },

  {
    name: "Pizza Hải Sản Đặc Biệt",
    image: "/uploads/assets/Pizza_1.jpg",
    price: 56000,
    description:
      "Tôm, mực, cua, sốt mayonnaise, phô mai Mozzarella, rau thơm trên đế bánh giòn",
    category: "Hải sản",
    mainCategory: "Pizza",
  },
  {
    name: "Pizza Pepperoni Phô Mai",
    image: "/uploads/assets/Pizza_2.jpg",
    price: 66000,
    description:
      "Xúc xích Pepperoni, phô mai Mozzarella gấp đôi, sốt cà chua đặc biệt",
    category: "Thịt",
    mainCategory: "Pizza",
  },
  {
    name: "Pizza Rau Củ Thuần Chay",
    image: "/uploads/assets/Pizza_3.jpg",
    price: 79000,
    description:
      "Ớt chuông, nấm, ô liu, cà chua, bắp, phô mai chay, lá oregano",
    category: "Chay",
    mainCategory: "Pizza",
  },
  {
    name: "Pizza Hawaii",
    image: "/uploads/assets/Pizza_4.jpg",
    price: 76000,
    description: "Thịt nguội, dứa, phô mai Mozzarella, sốt cà chua ngọt",
    category: "Thịt",
    mainCategory: "Pizza",
  },
  {
    name: "Pizza Thịt Tổng Hợp",
    image: "/uploads/assets/Pizza_5.jpg",
    price: 89000,
    description: "Thịt bò, thịt heo, gà, xúc xích, phô mai Mozzarella, sốt BBQ",
    category: "Thịt",
    mainCategory: "Pizza",
  },
  {
    name: "Pizza Margherita",
    image: "/uploads/assets/Pizza_12.jpg",
    price: 69000,
    description:
      "Cà chua tươi, phô mai Mozzarella, lá húng quế, dầu ô liu nguyên chất",
    category: "Chay",
    mainCategory: "Pizza",
  },
  {
    name: "Pizza Bốn Loại Phô Mai",
    image: "/uploads/assets/Pizza_7.jpg",
    price: 36000,
    description:
      "Phô mai Mozzarella, Gorgonzola, Parmesan, Ricotta, sốt kem trắng",
    category: "Chay",
    mainCategory: "Pizza",
  },
  {
    name: "Pizza Gà BBQ",
    image: "/uploads/assets/Pizza_8.jpg",
    price: 99000,
    description:
      "Thịt gà nướng, hành tây đỏ, ớt chuông, phô mai Mozzarella, sốt BBQ",
    category: "Gà",
    mainCategory: "Pizza",
  },
  {
    name: "Pizza Địa Trung Hải",
    image: "/uploads/assets/Pizza_9.jpg",
    price: 56000,
    description:
      "Phô mai Feta, ô liu, cà chua khô, húng quế, oregano, dầu ô liu",
    category: "Chay",
    mainCategory: "Pizza",
  },
  {
    name: "Pizza Cay Đặc Biệt",
    image: "/uploads/assets/Pizza_10.jpg",
    price: 36000,
    description:
      "Xúc xích cay, ớt jalapeño, hành tây, ớt chuông, phô mai Mozzarella",
    category: "Khác",
    mainCategory: "Pizza",
  },
  {
    name: "Pizza Nấm Truffle",
    image: "/uploads/assets/Pizza_11.jpg",
    price: 105000,
    description:
      "Nấm đông cô, nấm kim châm, nấm mỡ, phô mai Mozzarella, dầu nấm truffle",
    category: "Chay",
    mainCategory: "Pizza",
  },
  {
    name: "Pizza Thập Cẩm",
    image: "/uploads/assets/Pizza_13.jpg",
    price: 105000,
    description:
      "Tôm, thịt xông khói, xúc xích, ớt chuông, hành tây, nấm, phô mai Mozzarella",
    category: "Khác",
    mainCategory: "Pizza",
  },

  {
    name: "Gà rán giòn",
    image: "/uploads/assets/Chicken_1.jpg",
    price: 119000,
    description:
      "Gà được tẩm ướp gia vị đặc biệt, rán giòn bên ngoài, mềm juicy bên trong",
    category: "Giòn",
    mainCategory: "Chicken",
  },
  {
    name: "Gà sốt cay Hàn Quốc",
    image: "/uploads/assets/Chicken_2.jpg",
    price: 66000,
    description: "Gà rán phủ sốt cay ngọt kiểu Hàn Quốc, rắc vừng và hành lá",
    category: "Sốt",
    mainCategory: "Chicken",
  },
  {
    name: "Gà sốt mật ong tỏi",
    image: "/uploads/assets/Chicken_3.jpg",
    price: 125000,
    description: "Gà rán phủ sốt mật ong tỏi thơm ngọt, rắc vừng và rau thơm",
    category: "Sốt",
    mainCategory: "Chicken",
  },
  {
    name: "Cánh gà rán giòn",
    image: "/uploads/assets/Chicken_4.jpg",
    price: 109000,
    description: "Cánh gà tẩm bột chiên giòn, thơm ngon với lớp vỏ giòn rụm",
    category: "Giòn",
    mainCategory: "Chicken",
  },
  {
    name: "Gà sốt chua ngọt",
    image: "/uploads/assets/Chicken_5.jpg",
    price: 135000,
    description: "Gà rán phủ sốt chua ngọt thơm ngon, kèm ớt chuông và dứa",
    category: "Sốt",
    mainCategory: "Chicken",
  },
  {
    name: "Combo gà giòn đặc biệt",
    image: "/uploads/assets/Chicken_6.jpg",
    price: 149000,
    description: "Combo gồm 2 đùi gà, 2 cánh gà và 2 miếng gà không xương",
    category: "Chicken",
    mainCategory: "Chicken",
  },
  {
    name: "Gà viên giòn",
    image: "/uploads/assets/Chicken_7.jpg",
    price: 99000,
    description: "Gà viên tẩm bột chiên giòn, kèm sốt chấm tự chọn",
    category: "Giòn",
    mainCategory: "Chicken",
  },
  {
    name: "Gà sốt teriyaki",
    image: "/uploads/assets/Chicken_8.jpg",
    price: 139000,
    description: "Gà rán phủ sốt teriyaki Nhật Bản, rắc vừng và hành lá",
    category: "Sốt",
    mainCategory: "Chicken",
  },
  {
    name: "Combo gà giòn gia đình",
    image: "/uploads/assets/Chicken_9.jpg",
    price: 159000,
    description: "Combo gồm 8 miếng gà giòn các loại, phù hợp cho 3-4 người",
    category: "Chicken",
    mainCategory: "Combo",
  },
  {
    name: "Gà sốt BBQ",
    image: "/uploads/assets/Chicken_10.jpg",
    price: 132000,
    description: "Gà rán phủ sốt BBQ đậm đà, thơm mùi khói",
    category: "Sốt",
    mainCategory: "Chicken",
  },
  {
    name: "Đùi gà rán giòn",
    image: "/uploads/assets/Chicken_11.jpg",
    price: 115000,
    description: "Đùi gà tẩm bột chiên giòn, thịt mềm juicy bên trong",
    category: "Giòn",
    mainCategory: "Chicken",
  },
  {
    name: "Gà sốt Buffalo",
    image: "/uploads/assets/Chicken_12.jpg",
    price: 145000,
    description: "Gà rán phủ sốt Buffalo cay nồng, kèm sốt phô mai xanh",
    category: "Sốt",
    mainCategory: "Chicken",
  },

  {
    name: "Coca-Cola",
    image: "/uploads/assets/Drink_1.jpg",
    price: 25000,
    description: "Nước ngọt có ga Coca Cola mát lạnh, sảng khoái",
    category: "Nước ngọt",
    mainCategory: "Thức uống",
  },
  {
    name: "Trà sữa trân châu đường nâu",
    image: "/uploads/assets/Drink_2.jpg",
    price: 45000,
    description:
      "Trà sữa thơm béo kết hợp với trân châu dẻo và đường nâu đặc trưng",
    category: "Trà sữa",
    mainCategory: "Thức uống",
  },
  {
    name: "Cà phê đen",
    image: "/uploads/assets/Drink_3.jpg",
    price: 39000,
    description: "Cà phê đen đậm đà, hương vị mạnh mẽ, không đường",
    category: "Cà phê",
    mainCategory: "Thức uống",
  },
  {
    name: "Sinh tố dâu",
    image: "/uploads/assets/Drink_4.jpg",
    price: 49000,
    description: "Sinh tố dâu tươi ngọt tự nhiên, không thêm đường",
    category: "Sinh tố",
    mainCategory: "Thức uống",
  },
  {
    name: "Sprite",
    image: "/uploads/assets/Drink_5.jpg",
    price: 25000,
    description: "Nước ngọt có ga vị chanh mát lạnh, giải khát tức thì",
    category: "Nước ngọt",
    mainCategory: "Thức uống",
  },
  {
    name: "Trà sữa khoai môn",
    image: "/uploads/assets/Drink_6.jpg",
    price: 42000,
    description: "Trà sữa vị khoai môn thơm béo, kết hợp với trân châu dẻo",
    category: "Trà sữa",
    mainCategory: "Thức uống",
  },
  {
    name: "Cappuccino",
    image: "/uploads/assets/Drink_7.jpg",
    price: 45000,
    description: "Cà phê Ý với lớp bọt sữa mịn màng, hương vị cân bằng",
    category: "Cà phê",
    mainCategory: "Thức uống",
  },
  {
    name: "Sinh tố rau xanh",
    image: "/uploads/assets/Drink_8.jpg",
    price: 52000,
    description:
      "Sinh tố rau xanh kết hợp chuối và hạt chia, bổ dưỡng không đường",
    category: "Sinh tố",
    mainCategory: "Thức uống",
  },
  {
    name: "Pepsi",
    image: "/uploads/assets/Drink_9.jpg",
    price: 25000,
    description: "Nước ngọt có ga Pepsi mát lạnh, hương vị đặc trưng",
    category: "Nước ngọt",
    mainCategory: "Thức uống",
  },

  {
    name: "Trà sữa matcha",
    image: "/uploads/assets/Drink_10.jpg",
    price: 48000,
    description:
      "Trà sữa vị matcha Nhật Bản thơm béo, kết hợp với trân châu dẻo",
    category: "Trà sữa",
    mainCategory: "Thức uống",
  },
  {
    name: "Cà phê sữa đá",
    image: "/uploads/assets/Drink_11.jpg",
    price: 49000,
    description:
      "Cà phê đậm đà kết hợp với sữa đặc, phục vụ với đá, không đường",
    category: "Cà phê",
    mainCategory: "Thức uống",
  },
  {
    name: "Sinh tố xoài",
    image: "/uploads/assets/Drink_12.jpg",
    price: 55000,
    description: "Sinh tố xoài tươi ngọt tự nhiên, không thêm đường",
    category: "Sinh tố",
    mainCategory: "Thức uống",
  },

  {
    name: "Bánh phô mai nướng",
    image: "/uploads/assets/Derset_1.jpg",
    price: 69000,
    description: "Mềm mịn, vị béo ngậy, lớp phô mai nướng thơm lừng.",
    category: "Bánh",
    mainCategory: "Tráng miệng",
  },
  {
    name: "Kem vani socola",
    image: "/uploads/assets/Derset_2.jpg",
    price: 45000,
    description: "Kem mát lạnh, vị vani béo ngậy, sốt socola đậm đà.",
    category: "Kem",
    mainCategory: "Tráng miệng",
  },
  {
    name: "Pudding trứng caramel",
    image: "/uploads/assets/Derset_3.jpg",
    price: 39000,
    description: "Món tráng miệng truyền thống, ngọt nhẹ, mềm tan trong miệng.",
    category: "Bánh",
    mainCategory: "Tráng miệng",
  },
  {
    name: "Bánh Donut socola",
    image: "/uploads/assets/Derset_4.jpg",
    price: 35000,
    description: "Donut giòn mềm, phủ socola đậm vị, rắc hạt cốm ngọt.",
    category: "Bánh",
    mainCategory: "Tráng miệng",
  },
  {
    name: "Tart trái cây nhiệt đới",
    image: "/uploads/assets/Derset_5.jpg",
    price: 89000,
    description: "Đế giòn, nhân kem trứng, phủ trái cây tươi theo mùa.",
    category: "Trái cây",
    mainCategory: "Tráng miệng",
  },
  {
    name: "Kem xoài dừa",
    image: "/uploads/assets/Derset_6.jpg",
    price: 42000,
    description: "Vị ngọt thanh từ xoài chín kết hợp dừa sợi mát lạnh.",
    category: "Kem",
    mainCategory: "Tráng miệng",
  },
  {
    name: "Bánh su kem",
    image: "/uploads/assets/Derset_7.jpg",
    price: 32000,
    description: "Vỏ bánh giòn, nhân kem vani mịn thơm, dùng lạnh ngon nhất.",
    category: "Bánh",
    mainCategory: "Tráng miệng",
  },
  {
    name: "Chè khúc bạch",
    image: "/uploads/assets/Derset_8.jpg",
    price: 38000,
    description: "Khối thạch sữa béo, hạnh nhân giòn, ăn kèm nhãn, siro vải.",
    category: "Chè",
    mainCategory: "Tráng miệng",
  },
  {
    name: "Bánh flan trứng sữa",
    image: "/uploads/assets/Derset_9.jpg",
    price: 30000,
    description: "Vị ngọt nhẹ, béo mịn, phủ lớp caramel nâu bóng.",
    category: "Bánh",
    mainCategory: "Tráng miệng",
  },

  {
    name: "Chè xoài Hồng Kông",
    image: "/uploads/assets/Derset_10.jpg",
    price: 49000,
    description:
      "Xoài tươi, nước cốt dừa, thạch dừa, trân châu mini, vị nhiệt đới mát lạnh.",
    category: "Chè",
    mainCategory: "Tráng miệng",
  },
  {
    name: "Kem dừa non",
    image: "/uploads/assets/Derset_11.jpg",
    price: 43000,
    description: "Kem dừa sánh mịn, topping dừa sợi, ăn kèm đậu phộng rang.",
    category: "Kem",
    mainCategory: "Tráng miệng",
  },
  {
    name: "Thạch trái cây 3 tầng",
    image: "/uploads/assets/Derset_12.jpg",
    price: 35000,
    description:
      "3 lớp vị dâu – cam – nho, màu sắc bắt mắt, mát lạnh sảng khoái.",
    category: "Trái cây",
    mainCategory: "Tráng miệng",
  },
];
// const seedProducts = async () => {
//   await connectDB();

//   try {
//     await Product.deleteMany();
//     console.log("Old products removed");

//     await Product.insertMany(data);
//     console.log("New products inserted");

//     process.exit();
//   } catch (err) {
//     console.error("Seeding error:", err);
//     process.exit(1);
//   }
// };

// seedProducts();
async function seedData() {
  try {
    await connectDB(); // kết nối DB
    console.log("MongoDB connected");

    // Xóa toàn bộ dữ liệu cũ trong collection products
    await Product.deleteMany({});
    console.log("Old products deleted");

    // Thêm dữ liệu mới
    await Product.insertMany(data);
    console.log("Data inserted");

    process.exit(); // thoát tiến trình
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seedData();
