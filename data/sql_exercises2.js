// Thực hành bổ sung: 4 bài × 5 phần = 20 câu.
window.SQLX = window.SQLX.concat([
{title:"Ngân hàng", story:"SoDu và SoTien tính bằng triệu đồng. LoaiGD là NAP hoặc RUT.",
schema:`CREATE TABLE KHACHHANG(MaKH TEXT PRIMARY KEY, TenKH TEXT, ThanhPho TEXT);
CREATE TABLE TAIKHOAN(SoTK TEXT PRIMARY KEY, MaKH TEXT REFERENCES KHACHHANG(MaKH), LoaiTK TEXT, SoDu INT);
CREATE TABLE GIAODICH(MaGD INT PRIMARY KEY, SoTK TEXT REFERENCES TAIKHOAN(SoTK), NgayGD TEXT, LoaiGD TEXT, SoTien INT);`,
seed:`INSERT INTO KHACHHANG VALUES('K1','An','HN'),('K2','Bình','HCM'),('K3','Chi','HN'),('K4','Duy','DN');
INSERT INTO TAIKHOAN VALUES('T1','K1','ThanhToan',20),('T2','K1','TietKiem',100),('T3','K2','TietKiem',50),('T4','K3','ThanhToan',5),('T5','K2','ThanhToan',30);
INSERT INTO GIAODICH VALUES(1,'T1','2025-10-01','NAP',10),(2,'T1','2025-10-05','RUT',3),(3,'T3','2025-10-06','NAP',50),(4,'T4','2025-10-07','RUT',2),(5,'T5','2025-10-08','NAP',5),(6,'T5','2025-10-09','RUT',1);`,
hidden:`INSERT INTO TAIKHOAN VALUES('T6','K4','TietKiem',70),('T7','K3','TietKiem',120),('T8','K4','ThanhToan',1);
INSERT INTO GIAODICH VALUES(7,'T2','2025-10-10','NAP',20),(8,'T6','2025-10-11','RUT',4),(9,'T6','2025-10-12','RUT',6);`,
parts:[
{t:"Liệt kê SoTK, SoDu của các tài khoản TietKiem có số dư từ 50 trở lên, sắp giảm dần theo SoDu.",h:"WHERE với AND, ORDER BY DESC.",ord:1,sql:"SELECT SoTK, SoDu FROM TAIKHOAN WHERE LoaiTK='TietKiem' AND SoDu>=50 ORDER BY SoDu DESC"},
{t:"Với mỗi khách hàng có tài khoản, cho biết TenKH và TongSoDu.",h:"Kết hai bảng, SUM và GROUP BY MaKH.",sql:"SELECT k.TenKH, SUM(t.SoDu) AS TongSoDu FROM KHACHHANG k JOIN TAIKHOAN t ON k.MaKH=t.MaKH GROUP BY k.MaKH, k.TenKH"},
{t:"Tìm khách hàng có từ 2 tài khoản trở lên: TenKH, SoTaiKhoan.",h:"HAVING COUNT(*) >= 2.",sql:"SELECT k.TenKH, COUNT(*) AS SoTaiKhoan FROM KHACHHANG k JOIN TAIKHOAN t ON k.MaKH=t.MaKH GROUP BY k.MaKH, k.TenKH HAVING COUNT(*)>=2"},
{t:"Tìm SoTK, LoaiTK của các tài khoản chưa có giao dịch nào.",h:"NOT EXISTS hoặc LEFT JOIN ... IS NULL.",sql:"SELECT SoTK, LoaiTK FROM TAIKHOAN t WHERE NOT EXISTS (SELECT 1 FROM GIAODICH g WHERE g.SoTK=t.SoTK)"},
{t:"Với mỗi tài khoản đã có giao dịch, tính SoTK và ChenhLech (tổng tiền NAP trừ tổng tiền RUT).",h:"SUM(CASE WHEN LoaiGD='NAP' THEN SoTien ELSE -SoTien END).",sql:"SELECT SoTK, SUM(CASE WHEN LoaiGD='NAP' THEN SoTien ELSE -SoTien END) AS ChenhLech FROM GIAODICH GROUP BY SoTK"},
]},
{title:"Ứng dụng giao đồ ăn", story:"Đơn có TrangThai là HoanThanh hoặc Huy. Chỉ đơn HoanThanh mới tính doanh thu. Giá tính bằng nghìn đồng.",
schema:`CREATE TABLE QUAN(MaQ TEXT PRIMARY KEY, TenQ TEXT, KhuVuc TEXT);
CREATE TABLE MON(MaMon TEXT PRIMARY KEY, MaQ TEXT REFERENCES QUAN(MaQ), TenMon TEXT, Gia INT);
CREATE TABLE NGUOIDUNG(MaND TEXT PRIMARY KEY, TenND TEXT);
CREATE TABLE DON(MaDon TEXT PRIMARY KEY, MaND TEXT REFERENCES NGUOIDUNG(MaND), MaQ TEXT REFERENCES QUAN(MaQ), Ngay TEXT, TrangThai TEXT);
CREATE TABLE CT(MaDon TEXT REFERENCES DON(MaDon), MaMon TEXT REFERENCES MON(MaMon), SoLuong INT, PRIMARY KEY(MaDon,MaMon));`,
seed:`INSERT INTO QUAN VALUES('Q1','Cơm Ngon','TrungTam'),('Q2','Phở Việt','TrungTam'),('Q3','Trà Chiều','NgoaiO');
INSERT INTO MON VALUES('M1','Q1','Cơm gà',45),('M2','Q1','Cơm sườn',55),('M3','Q2','Phở bò',60),('M4','Q2','Phở gà',50),('M5','Q3','Trà đào',30),('M6','Q3','Bánh ngọt',35);
INSERT INTO NGUOIDUNG VALUES('U1','An'),('U2','Bình'),('U3','Chi'),('U4','Dũng');
INSERT INTO DON VALUES('D1','U1','Q1','2025-10-01','HoanThanh'),('D2','U2','Q1','2025-10-02','HoanThanh'),('D3','U1','Q2','2025-10-03','Huy'),('D4','U3','Q2','2025-10-04','HoanThanh'),('D5','U2','Q3','2025-10-05','Huy');
INSERT INTO CT VALUES('D1','M1',2),('D1','M2',1),('D2','M1',1),('D2','M2',3),('D3','M3',1),('D4','M3',1),('D4','M4',4),('D5','M5',2);`,
hidden:`INSERT INTO NGUOIDUNG VALUES('U5','Em');
INSERT INTO DON VALUES('D6','U5','Q3','2025-10-06','Huy'),('D7','U1','Q3','2025-10-07','HoanThanh');
INSERT INTO CT VALUES('D6','M5',1),('D7','M5',3),('D7','M6',3);
INSERT INTO MON VALUES('M7','Q2','Phở đặc biệt',90);`,
parts:[
{t:"Liệt kê TenMon, Gia của các món giá từ 50 trở lên, sắp giảm dần theo Gia.",h:"WHERE và ORDER BY DESC.",ord:1,sql:"SELECT TenMon, Gia FROM MON WHERE Gia>=50 ORDER BY Gia DESC"},
{t:"Với mỗi đơn, cho biết MaDon, TenND, TenQ.",h:"Kết DON với NGUOIDUNG và QUAN.",sql:"SELECT d.MaDon, u.TenND, q.TenQ FROM DON d JOIN NGUOIDUNG u ON d.MaND=u.MaND JOIN QUAN q ON d.MaQ=q.MaQ"},
{t:"Tính doanh thu của từng quán có đơn hoàn thành: TenQ, DoanhThu (chỉ tính đơn HoanThanh).",h:"Lọc TrangThai trước khi SUM(SoLuong*Gia).",sql:"SELECT q.TenQ, SUM(c.SoLuong*m.Gia) AS DoanhThu FROM DON d JOIN CT c ON d.MaDon=c.MaDon JOIN MON m ON c.MaMon=m.MaMon JOIN QUAN q ON d.MaQ=q.MaQ WHERE d.TrangThai='HoanThanh' GROUP BY q.MaQ, q.TenQ"},
{t:"Tìm MaND, TenND của người dùng chưa có đơn hoàn thành nào (kể cả người chưa từng đặt).",h:"NOT EXISTS trên các đơn HoanThanh của người đó.",sql:"SELECT MaND, TenND FROM NGUOIDUNG u WHERE NOT EXISTS (SELECT 1 FROM DON d WHERE d.MaND=u.MaND AND d.TrangThai='HoanThanh')"},
{t:"Với mỗi quán có đơn hoàn thành, tìm (các) món bán nhiều nhất: TenQ, TenMon, TongSL. Chỉ tính đơn HoanThanh; nếu đồng hạng phải liệt kê tất cả.",h:"Tính tổng theo món, rồi so với MAX trong cùng quán (truy vấn con tương quan hoặc WITH).",sql:"WITH t AS (SELECT m.MaQ, m.MaMon, m.TenMon, SUM(c.SoLuong) AS TongSL FROM CT c JOIN DON d ON c.MaDon=d.MaDon JOIN MON m ON c.MaMon=m.MaMon WHERE d.TrangThai='HoanThanh' GROUP BY m.MaQ, m.MaMon, m.TenMon) SELECT q.TenQ, t.TenMon, t.TongSL FROM t JOIN QUAN q ON t.MaQ=q.MaQ WHERE t.TongSL=(SELECT MAX(x.TongSL) FROM t x WHERE x.MaQ=t.MaQ)"},
]},
{title:"Nghe nhạc trực tuyến", story:"Mỗi dòng LUOTNGHE là một lượt nghe. ThoiLuong tính bằng giây.",
schema:`CREATE TABLE NGHESI(MaNS TEXT PRIMARY KEY, TenNS TEXT, QuocGia TEXT);
CREATE TABLE BAIHAT(MaBH TEXT PRIMARY KEY, TenBH TEXT, MaNS TEXT REFERENCES NGHESI(MaNS), ThoiLuong INT, TheLoai TEXT);
CREATE TABLE NGUOIDUNG(MaND TEXT PRIMARY KEY, TenND TEXT, Goi TEXT);
CREATE TABLE LUOTNGHE(MaLN INT PRIMARY KEY, MaND TEXT REFERENCES NGUOIDUNG(MaND), MaBH TEXT REFERENCES BAIHAT(MaBH), ThoiDiem TEXT);`,
seed:`INSERT INTO NGHESI VALUES('N1','Mây','VN'),('N2','Sky','US'),('N3','Luna','KR');
INSERT INTO BAIHAT VALUES('B1','Hoa nắng','N1',210,'Pop'),('B2','Mưa','N1',190,'Ballad'),('B3','Fly','N2',240,'Pop'),('B4','Run','N2',205,'Rock'),('B5','Moon','N3',230,'Pop'),('B6','Star','N3',180,'Pop');
INSERT INTO NGUOIDUNG VALUES('U1','An','Premium'),('U2','Bình','Free'),('U3','Chi','Premium'),('U4','Dũng','Premium');
INSERT INTO LUOTNGHE VALUES(1,'U1','B1','2025-10-01'),(2,'U1','B1','2025-10-02'),(3,'U1','B3','2025-10-03'),(4,'U2','B1','2025-10-03'),(5,'U2','B3','2025-10-04'),(6,'U2','B5','2025-10-05'),(7,'U3','B3','2025-10-05'),(8,'U3','B4','2025-10-06'),(9,'U1','B5','2025-10-07');`,
hidden:`INSERT INTO BAIHAT VALUES('B7','Sun','N2',250,'Pop');
INSERT INTO NGUOIDUNG VALUES('U5','Em','Premium');
INSERT INTO LUOTNGHE VALUES(10,'U3','B1','2025-10-08'),(11,'U4','B3','2025-10-08'),(12,'U4','B4','2025-10-09'),(13,'U1','B6','2025-10-09'),(14,'U4','B3','2025-10-10');`,
parts:[
{t:"Liệt kê TenBH, ThoiLuong của các bài Pop dài hơn 200 giây, sắp giảm dần theo ThoiLuong.",h:"Hai điều kiện và ORDER BY DESC.",ord:1,sql:"SELECT TenBH, ThoiLuong FROM BAIHAT WHERE TheLoai='Pop' AND ThoiLuong>200 ORDER BY ThoiLuong DESC"},
{t:"Với MỌI bài hát, kể cả bài chưa có lượt nghe, cho biết TenBH, TenNS, SoLuot.",h:"LEFT JOIN LUOTNGHE và COUNT(cột của LUOTNGHE).",sql:"SELECT b.TenBH, n.TenNS, COUNT(l.MaLN) AS SoLuot FROM BAIHAT b JOIN NGHESI n ON b.MaNS=n.MaNS LEFT JOIN LUOTNGHE l ON b.MaBH=l.MaBH GROUP BY b.MaBH, b.TenBH, n.TenNS"},
{t:"Tìm người dùng đã nghe từ 2 nghệ sĩ khác nhau trở lên: TenND, SoNgheSi.",h:"COUNT(DISTINCT MaNS), phải kết thêm BAIHAT.",sql:"SELECT u.TenND, COUNT(DISTINCT b.MaNS) AS SoNgheSi FROM NGUOIDUNG u JOIN LUOTNGHE l ON u.MaND=l.MaND JOIN BAIHAT b ON l.MaBH=b.MaBH GROUP BY u.MaND, u.TenND HAVING COUNT(DISTINCT b.MaNS)>=2"},
{t:"Tìm MaND, TenND của người dùng gói Premium chưa từng nghe bài nào của nghệ sĩ N1.",h:"Truy vấn con kết LUOTNGHE với BAIHAT.",sql:"SELECT MaND, TenND FROM NGUOIDUNG u WHERE Goi='Premium' AND NOT EXISTS (SELECT 1 FROM LUOTNGHE l JOIN BAIHAT b ON l.MaBH=b.MaBH WHERE l.MaND=u.MaND AND b.MaNS='N1')"},
{t:"Tìm các cặp người dùng cùng nghe từ 2 bài khác nhau trở lên: ND1, ND2, SoBaiChung, với mã ND1 nhỏ hơn mã ND2.",h:"Tự kết LUOTNGHE theo MaBH, điều kiện a.MaND < b.MaND, đếm DISTINCT MaBH.",sql:"SELECT a.MaND AS ND1, b.MaND AS ND2, COUNT(DISTINCT a.MaBH) AS SoBaiChung FROM LUOTNGHE a JOIN LUOTNGHE b ON a.MaBH=b.MaBH AND a.MaND<b.MaND GROUP BY a.MaND, b.MaND HAVING COUNT(DISTINCT a.MaBH)>=2"},
]},
{title:"Ký túc xá", story:"Bảng O lưu lịch sử ở của sinh viên. NgayRa = NULL nghĩa là sinh viên đang ở phòng đó.",
schema:`CREATE TABLE TOA(MaToa TEXT PRIMARY KEY, TenToa TEXT);
CREATE TABLE PHONG(MaPhong TEXT PRIMARY KEY, MaToa TEXT REFERENCES TOA(MaToa), SucChua INT);
CREATE TABLE SINHVIEN(MaSV TEXT PRIMARY KEY, HoTen TEXT, Khoa TEXT);
CREATE TABLE O(MaSV TEXT REFERENCES SINHVIEN(MaSV), MaPhong TEXT REFERENCES PHONG(MaPhong), NgayVao TEXT, NgayRa TEXT, PRIMARY KEY(MaSV,NgayVao));`,
seed:`INSERT INTO TOA VALUES('T1','Tòa A'),('T2','Tòa B'),('T3','Tòa C');
INSERT INTO PHONG VALUES('P101','T1',4),('P102','T1',6),('P201','T2',4),('P202','T2',2),('P301','T3',8);
INSERT INTO SINHVIEN VALUES('S1','An','CNTT'),('S2','Bình','CNTT'),('S3','Chi','KT'),('S4','Dũng','KT'),('S5','Hà','NN'),('S6','Khoa','NN');
INSERT INTO O VALUES('S1','P101','2024-09-01','2025-06-30'),('S1','P201','2025-09-01',NULL),('S2','P101','2025-09-01',NULL),('S3','P202','2024-09-01','2025-01-15'),('S3','P102','2025-01-16',NULL),('S4','P201','2025-09-01',NULL),('S5','P101','2024-09-01','2025-06-30');`,
hidden:`INSERT INTO SINHVIEN VALUES('S7','Yến','KT');
INSERT INTO PHONG VALUES('P103','T1',5);
INSERT INTO O VALUES('S5','P301','2025-09-01',NULL),('S2','P102','2024-09-01','2025-06-30'),('S7','P301','2025-09-02',NULL);`,
parts:[
{t:"Liệt kê MaPhong, SucChua của các phòng thuộc tòa T1 có sức chứa từ 4 trở lên, sắp giảm dần theo SucChua.",h:"WHERE và ORDER BY DESC.",ord:1,sql:"SELECT MaPhong, SucChua FROM PHONG WHERE MaToa='T1' AND SucChua>=4 ORDER BY SucChua DESC"},
{t:"Liệt kê sinh viên đang ở ký túc xá: HoTen, MaPhong, TenToa.",h:"NgayRa IS NULL, kết 4 bảng.",sql:"SELECT s.HoTen, o.MaPhong, t.TenToa FROM O o JOIN SINHVIEN s ON o.MaSV=s.MaSV JOIN PHONG p ON o.MaPhong=p.MaPhong JOIN TOA t ON p.MaToa=t.MaToa WHERE o.NgayRa IS NULL"},
{t:"Với MỌI phòng, kể cả phòng trống, cho biết MaPhong, DangO (số sinh viên đang ở), ConTrong (sức chứa trừ số đang ở).",h:"Đặt điều kiện NgayRa IS NULL trong ON của LEFT JOIN, không đặt ở WHERE.",sql:"SELECT p.MaPhong, COUNT(o.MaSV) AS DangO, p.SucChua-COUNT(o.MaSV) AS ConTrong FROM PHONG p LEFT JOIN O o ON p.MaPhong=o.MaPhong AND o.NgayRa IS NULL GROUP BY p.MaPhong, p.SucChua"},
{t:"Tìm MaSV, HoTen của sinh viên chưa từng ở ký túc xá.",h:"NOT IN hoặc NOT EXISTS.",sql:"SELECT MaSV, HoTen FROM SINHVIEN WHERE MaSV NOT IN (SELECT MaSV FROM O)"},
{t:"Tìm sinh viên từng ở từ 2 tòa khác nhau trở lên: MaSV, HoTen, SoToa.",h:"Kết O với PHONG, COUNT(DISTINCT MaToa).",sql:"SELECT s.MaSV, s.HoTen, COUNT(DISTINCT p.MaToa) AS SoToa FROM SINHVIEN s JOIN O o ON s.MaSV=o.MaSV JOIN PHONG p ON o.MaPhong=p.MaPhong GROUP BY s.MaSV, s.HoTen HAVING COUNT(DISTINCT p.MaToa)>=2"},
]},
]);
