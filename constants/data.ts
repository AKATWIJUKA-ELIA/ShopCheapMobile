import { openHelpSideBar } from "@/components/ui/help"

export const categories = [
  { title: 'Gadgets', image: {uri:'https://www.on-magazine.co.uk/wp-content/uploads/Tech-and-Gadgets-2025.jpg'} },
  { title: 'Computers', image: {uri:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpYMUQtUaGUFa-oP7lFNrwVHURWP0FRpYj2Q&s'} },
  { title: 'Accessories', image: {uri:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpYMUQtUaGUFa-oP7lFNrwVHURWP0FRpYj2Q&s'} },
  { title: 'Office & Education', image: {uri:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZm_hFXOus0Jh8xt1eaAaMUo54FLuooVa_nA&s'} },
  { title: 'Health & Beauty', image: {uri:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRuPCBnk8XsuElFEfu0sEqJg_OXAtD7rlaNsVvhgwRlf_zOzL-8NeAWVGVIlXvUGWrpp4&usqp=CAU'} },
  { title: 'Phones', image: {uri:'https://cdn.mos.cms.futurecdn.net/M4nigVN3vvA5EEnNX9atxY.jpg'}},
  { title: 'Jewelry & Watches', image: {uri:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTo4ohYsKbDBTK_z9yUUM7UoFLnhgG85QpBqA&s'}},
  { title: 'Home & Garden', image: {uri:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQjchx-hBVDkeUgH5SHlXaCcMovClW8AqZ8A&s'} },
  { title: 'Hair Extensions & Wigs', image: {uri:'https://divadivinehair.com/cdn/shop/articles/Diva_Divine_wigs_for_women_last_longer_than_others.png?v=1678427320&width=2048'} },
  { title: 'Men’s Clothing', image: {uri:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5XldnDDgRJg6PDhEB44oSQpBzwT4wTectQg&s'} },
  { title: 'Consumer Electronics', image: {uri:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0RnrYFJ6qXOI1cGD4FMU2iBZbYqRBzvOX5g&s'} },
  { title: 'Home Improvement & Lighting', image: {uri:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZdcebWMj7sP-JdIUe0vJxiDlPMlRMWjp_kQ&s'} },
  { title: 'Automotive & Motorcycles', image: {uri:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFP5V6g_1HbB7HmrR1kWyGWsLWoupvmmgWFQ&s'} },
  { title: 'Kids Section', image: {uri:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7VQXyr3u08x9FBYOfkMq05vnv5_BgYT1XUA&s'} },
  { title: 'Luggage & Bags', image: {uri:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQUO0iwXohDbOEb35cWVUo9nrn0AlAEJbSeQ&s'} },
  { title: 'Shoes', image: {uri:'https://global2019-static-cdn.kikuu.com/k-s-oss-1661587486287bRGfXk7XnK.jpg?x-oss-process=style/p85'} },
  { title: 'Special Occasion Costumes', image: 'https://i.pinimg.com/736x/25/e1/ee/25e1eebec11ea3a29176e62a4cd7c066.jpg' },
  { title: 'Women’s Clothing', image: {uri:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShHl7jHED0Lq4aOJYSpA7DAnqvJlg1h9Z9uA&s'}},
  { title: 'Sports & Entertainment', image: {uri:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-vzk2auIEyzGSpmzIDY_ywv3otSUK69Z1vQ&s'} },
  { title: 'Toys & Games', image: {uri:'https://www.linnworks.com/wp-content/uploads/2022/10/iStock-462170281-300x200.jpg'} },
  { title: 'Furniture', image: {uri:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjfP_N03wo4EGF35CarNP2CZrC1msT_nUB0A&s'} },
  { title: 'Lingerie & Loungewear', image: {uri:'https://www.dhresource.com/webp/m/0x0/f2/albu/g22/M01/6B/84/rBVaEmKtdhKAdEOWAAE3gyIQvfw453.jpg'}},
  { title: 'Vehicles', image: {uri:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMTWqH9gDYa75a6rgKo0wXxnv5hstj0t50QA&s'} },
  { title: 'Art & Craft', image: {uri:'https://img.freepik.com/free-photo/clay-tools-pottery_23-2148643318.jpg?semt=ais_incoming&w=740&q=80'} },
]

export const banners = [
  {uri:'https://cdn.prod.website-files.com/620e4101b2ce12a1a6bff0e8/643c489a16b3d0001e1736ba_Header_Top%2010%20Essential%20Gadgets%20for%20Students_MAR23.webp'},
  {uri:'https://reviewstreet.in/wp-content/uploads/2024/12/Top-10-Gadgets-of-2024-for-Smart-Travelers-in-India.png'},
  {uri:'https://www.on-magazine.co.uk/wp-content/uploads/Tech-and-Gadgets-2025.jpg'},
]

export const flashSale = new Array(8).fill(0).map((_, i) => ({
  title: `Flash Deal ${i + 1} 32GB Fast`,
  price: 'UGX 120,000',
  oldPrice: 'UGX 180,000',
  discount: '-33%',
  image: require('@/assets/images/phones.jpg')
}))

export const products = [
  {
    id: 1,
    name: "Apple Watch",
    category:'Health & Beauty',
    image:'https://files.refurbed.com/ii/apple-watch-se-44mm-2022-1707301441459256443.jpg?t=fitdesign&h=600&w=800',
    price: 299.99,
    description: "Stay connected and track your fitness goals"
  },
  {
    id: 2,
    name: "Samsung TV",
    category:'Electronics',
    image:'https://hips.hearstapps.com/hmg-prod/images/pop-samsung-tvs-65788972ac1af.jpg?crop=0.502xw:1.00xh;0.250xw,0&resize=640:*',
    price: 999.99,
    description: "Experience stunning 4K resolution and smart TV features"
  },
  {
    id: 3,
    name: "Nike Air Max",
    category:'Shoes',
    image:'https://static.nike.com/a/images/f_auto,cs_srgb/w_1536,c_limit/07b0a34a-8fba-4569-bff4-2b612f0251ae/nike-air-max-air-max-day.jpg',
    price: 129.99,
    description: "Stay stylish and comfortable with these iconic sneakers"
  },
  {
    id: 4,
    name: "Sony Headphones",
    category:'Electronics',
    image:'https://i5.walmartimages.com/asr/c985c1ec-b4f9-4ee2-a82e-16f88a18eac0.619c88d6ce90880cefe950ed735a1805.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF',
    price: 149.99,
    description: "Immerse yourself in crystal-clear sound with these wireless headphones"
  },
  {
    id: 5,
    name: "Macbook Pro",
    category:'Electronics',
    image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7kbvl9HCNd9Y_oagvuzhlfM-nF8X0-B6RIA&s',
    price: 1999.99,
    description: "Powerful and versatile laptop for everyday use"
  },
  {
    id: 6,
    name: "Canon Camera",
    category:'Electronics',
    image:'https://i5.walmartimages.com/asr/f7837d96-46a9-4a93-b2ae-7aae9d4a34b7.ee7886a1edadebb5617039a832aef144.jpeg',
    price: 799.99,
    description: "Capture stunning photos and videos with this high-end camera"
  },
  {
    id: 7,
    name: "PlayStation 5",
    category:'Electronics',
    image: 'https://cdn.mos.cms.futurecdn.net/sG7xNvwuo9EvpHByXSx3E3.jpg',
    price: 499.99,
    description: "Experience the next generation of gaming with this powerful console"
  }
]
