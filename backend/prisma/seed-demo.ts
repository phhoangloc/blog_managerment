import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

// Demo author and posts for trying out the home site. Safe to re-run: everything is upserted.
const prisma = new PrismaClient();

const AUTHOR = { username: 'locpham', email: 'locpham@example.com', password: 'demo1234' };

const posts = [
  {
    slug: 'bat-dau-tu-mot-to-ramen-o-shinjuku',
    title: 'Bắt đầu từ một tô ramen ở Shinjuku',
    category: 'Ẩm thực',
    detail: `<p>Tô ramen đầu tiên mình ăn ở Nhật là trong một quán nhỏ gần ga Shinjuku, chỉ có chừng mười hai chỗ ngồi quanh quầy. Mua vé ở máy bán tự động, đưa cho bếp, rồi ngồi chờ trong tiếng húp mì rôm rả.</p><p>Nước dùng đục, đậm vị xương heo, sợi mì dai hơn mình nghĩ. Điều mình nhớ nhất là sự yên lặng: ai cũng ăn nhanh, ăn gọn, rồi cảm ơn chủ quán trước khi ra về.</p><h2>Vài điều mình học được</h2><ul><li>Cứ húp mì thật to, không ai thấy phiền cả.</li><li>Có thể gọi thêm <em>kaedama</em> (mì thêm) khi còn nước dùng.</li><li>Ăn xong, trả ly nước lại lên quầy là một nét lịch sự nhỏ.</li></ul><p>Một tô ramen không đắt, nhưng nó cho mình cảm giác đầu tiên rất rõ về nhịp sống ở đây.</p>`,
  },
  {
    slug: 'mot-ngay-di-bo-o-kyoto',
    title: 'Một ngày đi bộ ở Kyoto',
    category: 'Du lịch',
    detail: `<p>Kyoto đẹp nhất khi mình đi bộ. Sáng sớm mình ghé Fushimi Inari, lúc hàng ngàn cổng torii còn vắng người, ánh nắng xuyên qua màu đỏ cam rất lạ.</p><p>Buổi trưa, mình ăn một bữa soba đơn giản ở con hẻm gần Gion, rồi men theo con kênh Shirakawa dạo chậm. Chiều muộn thì ngồi uống matcha ở một quán trà nhìn ra khu vườn nhỏ.</p><h2>Gợi ý nhỏ</h2><ul><li>Đến Fushimi Inari trước 7 giờ sáng để tránh đông.</li><li>Mang giày thoải mái, một ngày có thể đi hơn 20.000 bước.</li><li>Mua vé xe buýt một ngày nếu bạn định đi xa khỏi trung tâm.</li></ul>`,
  },
  {
    slug: 'nhung-dieu-ngo-ngang-khi-moi-den-nhat',
    title: 'Những điều ngỡ ngàng khi mới đến Nhật',
    category: 'Cuộc sống',
    detail: `<p>Ngày đầu đến Nhật, mình ngạc nhiên bởi những thứ rất nhỏ: người ta xếp hàng ngay ngắn chờ tàu, rác được phân loại kỹ, và cửa hàng tiện lợi có gần như mọi thứ bạn cần.</p><p>Sau vài tuần, mình mới hiểu rằng phía sau những điều đó là sự tôn trọng người khác một cách rất tự nhiên. Không ai ép, nhưng ai cũng làm.</p><h2>Ba điều mình cần thời gian để quen</h2><ol><li>Phân loại rác theo ngày trong tuần.</li><li>Giữ yên lặng trên tàu điện.</li><li>Cúi chào và nói cảm ơn nhiều hơn mình tưởng.</li></ol><p>Quen rồi mới thấy cuộc sống nhẹ nhàng hơn.</p>`,
  },
  {
    slug: 'ghi-chu-ve-viec-hoc-lap-trinh-moi-ngay',
    title: 'Ghi chú về việc học lập trình mỗi ngày',
    category: 'Lập trình',
    detail: `<p>Mình không còn đặt mục tiêu học thật nhiều trong một buổi. Thay vào đó, mỗi ngày mình dành khoảng một tiếng, đọc một đoạn code hoặc viết thử một chức năng nhỏ.</p><p>Điều giúp mình tiến bộ nhất không phải là khóa học nào, mà là xây một dự án thật, dù nhỏ, và sửa nó liên tục.</p><h2>Thói quen đang giữ</h2><ul><li>Viết lại những gì vừa học bằng lời của mình.</li><li>Đọc lỗi cẩn thận trước khi tìm câu trả lời.</li><li>Ghi lại các lỗi đã gặp để lần sau khỏi mất công.</li></ul><pre>const study = () => { read(); build(); note(); };</pre>`,
  },
  {
    slug: 'com-nha-o-nhat-bua-toi-don-gian',
    title: 'Cơm nhà ở Nhật: bữa tối đơn giản',
    category: 'Ẩm thực',
    detail: `<p>Sống xa nhà, bữa cơm tự nấu là thứ giữ mình cân bằng. Mình thường nấu cơm, canh miso, một món cá nướng và ít rau luộc, vừa nhanh vừa nhẹ bụng.</p><p>Siêu thị ở đây hay giảm giá đồ tươi vào buổi tối, nên mình hay ghé sau giờ làm để mua cá và rau với giá dễ chịu hơn.</p><h2>Thực đơn thử trong tuần</h2><ul><li>Cá saba nướng muối, canh miso đậu hũ.</li><li>Thịt heo xào gừng, cải bó xôi trộn mè.</li><li>Cơm chiên trứng với hành lá khi lười nấu.</li></ul><p>Không cầu kỳ, nhưng ăn xong thấy như đang ở nhà.</p>`,
  },
  {
    slug: 'mua-hoa-anh-dao-dau-tien',
    title: 'Mùa hoa anh đào đầu tiên',
    category: 'Du lịch',
    detail: `<p>Cuối tháng Ba, công viên gần nhà mình bỗng đổi màu hồng nhạt. Mọi người trải bạt dưới gốc cây, mang theo bento và trà, ngồi ngắm hoa như một nghi thức không cần nói ra.</p><p>Hoa nở rộ chỉ khoảng một tuần, rồi cánh hoa rơi như tuyết. Có lẽ vì ngắn ngủi nên người ta mới trân trọng đến vậy.</p><h2>Kinh nghiệm đi hanami</h2><ul><li>Giữ chỗ từ sáng sớm vào cuối tuần.</li><li>Mang theo túi rác để mang về, nhiều công viên không có thùng rác.</li><li>Đi buổi tối để ngắm hoa dưới đèn lồng.</li></ul>`,
  },
  {
    slug: 'tim-nha-thue-lan-dau-o-tokyo',
    title: 'Tìm nhà thuê lần đầu ở Tokyo',
    category: 'Cuộc sống',
    detail: `<p>Thuê nhà ở Nhật có nhiều khoản mà người mới như mình chưa từng nghe: tiền cọc, tiền lễ, phí môi giới và cả người bảo lãnh. Lần đầu mình đi xem nhà mà cứ ngơ ngác.</p><p>Sau vài lần, mình học được cách đọc bảng thông tin căn hộ và biết nên hỏi những gì trước khi quyết định.</p><h2>Danh sách cần hỏi</h2><ol><li>Khoảng cách tới ga gần nhất, đi bộ bao nhiêu phút.</li><li>Các khoản phí ban đầu gồm những gì.</li><li>Công ty bảo lãnh có được chấp nhận không.</li></ol>`,
  },
  {
    slug: 'hoc-git-qua-mot-du-an-nho',
    title: 'Học Git qua một dự án nhỏ',
    category: 'Lập trình',
    detail: `<p>Mình học Git hiệu quả nhất khi dùng nó cho một dự án thật. Mỗi tính năng một nhánh, mỗi thay đổi một commit rõ ràng, và đọc lại lịch sử khi cần tìm lỗi.</p><h2>Các lệnh mình dùng nhiều</h2><pre>git switch -c feature/about
git add -p
git commit -m "Add about page"
git log --oneline</pre><p>Viết commit message rõ ràng giúp mình tiết kiệm rất nhiều thời gian về sau.</p>`,
  },
  {
    slug: 'quan-cafe-nho-ben-duong-ray',
    title: 'Quán cà phê nhỏ bên đường ray',
    category: 'Ẩm thực',
    detail: `<p>Gần ga có một quán cà phê chỉ vừa sáu người ngồi, chủ quán là một bác lớn tuổi pha cà phê phin kiểu Nhật. Mỗi khi tàu chạy qua, tách cà phê khẽ rung.</p><p>Mình hay ghé vào chiều cuối tuần, gọi một ly cà phê nóng và một miếng bánh kem trứng, rồi ngồi đọc sách đến khi trời tối.</p><h2>Điều mình thích</h2><ul><li>Không gian yên tĩnh, nhạc jazz nhẹ.</li><li>Giá hợp lý cho một khu gần ga.</li><li>Chủ quán nhớ món quen của khách.</li></ul>`,
  },
  {
    slug: 'di-tau-dien-lan-dau-mot-minh',
    title: 'Đi tàu điện lần đầu một mình',
    category: 'Cuộc sống',
    detail: `<p>Bản đồ tàu điện Tokyo nhìn như một bát mì rối. Lần đầu tự đi, mình đứng trước bảng giá vé hơn năm phút mà vẫn chưa biết mua gì.</p><p>Sau khi dùng thẻ IC, mọi thứ trở nên đơn giản. Chỉ cần chạm thẻ là xong, không còn lo tính tiền.</p><h2>Mẹo nhỏ</h2><ul><li>Dùng ứng dụng tra tuyến để biết đúng sân ga và giờ tàu.</li><li>Đứng đúng vạch xếp hàng, nhường người xuống trước.</li><li>Tránh giờ cao điểm sáng 8 đến 9 giờ nếu có thể.</li></ul>`,
  },
  {
    slug: 'mot-buoi-toi-o-izakaya',
    title: 'Một buổi tối ở izakaya',
    category: 'Ẩm thực',
    detail: `<p>Izakaya là nơi đồng nghiệp ngồi lại sau giờ làm: vài xiên yakitori, đĩa edamame, và những ly bia lạnh. Câu chuyện thường bắt đầu bằng công việc rồi trôi dần sang chuyện đời.</p><p>Lần đầu đi, mình không biết gọi gì nên chỉ làm theo mọi người. Hóa ra các món nhỏ gọi chung và chia nhau mới là cách vui nhất.</p><h2>Gọi món thế nào</h2><ul><li>Bắt đầu bằng đồ uống, rồi gọi vài món nhẹ.</li><li>Gọi dần từng lượt thay vì gọi hết một lần.</li><li>Có thể có phí bàn nhỏ gọi là <em>otoshi</em>, đó là chuyện bình thường.</li></ul>`,
  },
];

async function main() {
  const author = await prisma.user.upsert({
    where: { username: AUTHOR.username },
    update: {},
    create: { username: AUTHOR.username, email: AUTHOR.email, password: await bcrypt.hash(AUTHOR.password, 10) },
  });
  const now = Date.now();
  for (const [i, p] of posts.entries()) {
    // newest first on the home page: the first post in the list is the most recent
    const createdAt = new Date(now - i * 3 * 24 * 60 * 60 * 1000);
    await prisma.blog.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, draft: false, authorId: author.id, createdAt },
    });
  }
  console.log(`Seeded author "${author.username}" and ${posts.length} demo posts`);
}

main().finally(() => prisma.$disconnect());
