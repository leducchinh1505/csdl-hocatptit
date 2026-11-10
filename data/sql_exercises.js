// 10 bài thực hành truy vấn. Bài nộp được chấm trên dữ liệu mẫu (seed) và dữ liệu mở rộng ẩn (hidden).
window.SQLX = [
{title:"Thư viện trường", story:"Quản lý sinh viên mượn sách. NgayTra = NULL nghĩa là chưa trả.",
schema:`CREATE TABLE SINHVIEN(MaSV TEXT PRIMARY KEY, HoTen TEXT, Khoa TEXT, NamSinh INT);
CREATE TABLE SACH(MaSach TEXT PRIMARY KEY, TenSach TEXT, TheLoai TEXT, NamXB INT);
CREATE TABLE MUON(MaMuon INT PRIMARY KEY, MaSV TEXT REFERENCES SINHVIEN(MaSV), MaSach TEXT REFERENCES SACH(MaSach), NgayMuon TEXT, NgayTra TEXT);`,
seed:`INSERT INTO SINHVIEN VALUES('SV01','An','CS',2004),('SV02','Bình','CS',2003),('SV03','Chi','IT',2004),('SV04','Dũng','MATH',2002),('SV05','Hà','CS',2005),('SV06','Khoa','IT',2003);
INSERT INTO SACH VALUES('S1','Cơ sở dữ liệu','GiaoTrinh',2020),('S2','Lập trình C','GiaoTrinh',2018),('S3','Nhà giả kim','TieuThuyet',2015),('S4','Dế Mèn','TieuThuyet',2010),('S5','Giải tích','ThamKhao',2019),('S6','Mạng máy tính','GiaoTrinh',2021);
INSERT INTO MUON VALUES(1,'SV01','S1','2025-09-01','2025-09-15'),(2,'SV01','S3','2025-10-01',NULL),(3,'SV02','S1','2025-09-20','2025-10-01'),(4,'SV03','S2','2025-09-05',NULL),(5,'SV03','S3','2025-10-10','2025-10-20'),(6,'SV04','S5','2025-09-12','2025-09-30'),(7,'SV01','S1','2025-11-01',NULL),(8,'SV02','S3','2025-11-03',NULL);`,
hidden:`INSERT INTO SINHVIEN VALUES('SV07','Yến','CS',2004);
INSERT INTO MUON VALUES(9,'SV05','S6','2025-11-05',NULL),(10,'SV05','S6','2025-11-07','2025-11-09'),(11,'SV06','S1','2025-11-06','2025-11-08');`,
parts:[
{t:"Liệt kê MaSV, HoTen của các sinh viên khoa CS, sắp xếp tăng dần theo HoTen.",h:"WHERE và ORDER BY.",ord:1,sql:"SELECT MaSV, HoTen FROM SINHVIEN WHERE Khoa='CS' ORDER BY HoTen"},
{t:"Với mỗi lượt mượn chưa trả, cho biết HoTen và TenSach.",h:"Kiểm tra NULL bằng IS NULL, kết 3 bảng.",sql:"SELECT sv.HoTen, s.TenSach FROM MUON m JOIN SINHVIEN sv ON m.MaSV=sv.MaSV JOIN SACH s ON m.MaSach=s.MaSach WHERE m.NgayTra IS NULL"},
{t:"Với mỗi thể loại có từ 2 lượt mượn trở lên, cho biết TheLoai và SoLuot (số lượt mượn).",h:"GROUP BY kết hợp HAVING.",sql:"SELECT s.TheLoai, COUNT(*) AS SoLuot FROM MUON m JOIN SACH s ON m.MaSach=s.MaSach GROUP BY s.TheLoai HAVING COUNT(*)>=2"},
{t:"Tìm MaSV, HoTen của sinh viên khoa CS chưa từng mượn sách.",h:"NOT EXISTS, NOT IN hoặc EXCEPT.",sql:"SELECT MaSV, HoTen FROM SINHVIEN sv WHERE Khoa='CS' AND NOT EXISTS (SELECT 1 FROM MUON m WHERE m.MaSV=sv.MaSV)"},
{t:"Tìm (các) sách được mượn nhiều lượt nhất: TenSach, SoLuot. Nếu đồng hạng phải liệt kê tất cả.",h:"So sánh với MAX của các số lượt trong truy vấn con.",sql:"SELECT s.TenSach, COUNT(*) AS SoLuot FROM MUON m JOIN SACH s ON m.MaSach=s.MaSach GROUP BY s.MaSach, s.TenSach HAVING COUNT(*)=(SELECT MAX(c) FROM (SELECT COUNT(*) AS c FROM MUON GROUP BY MaSach) x)"},
]},
{title:"Đào tạo & kết quả học tập", story:"Sinh viên có thể học lại, mỗi lần học là một dòng trong KETQUA.",
schema:`CREATE TABLE SINHVIEN(MaSV TEXT PRIMARY KEY, HoTen TEXT, Lop TEXT);
CREATE TABLE MONHOC(MaMon TEXT PRIMARY KEY, TenMon TEXT, SoTC INT);
CREATE TABLE KETQUA(MaSV TEXT REFERENCES SINHVIEN(MaSV), MaMon TEXT REFERENCES MONHOC(MaMon), HocKy INT, Diem REAL, PRIMARY KEY(MaSV,MaMon,HocKy));`,
seed:`INSERT INTO SINHVIEN VALUES('A1','Lan','K65'),('A2','Minh','K65'),('A3','Nam','K66'),('A4','Oanh','K66'),('A5','Phúc','K66');
INSERT INTO MONHOC VALUES('CSDL','Cơ sở dữ liệu',3),('MMT','Mạng máy tính',3),('HDH','Hệ điều hành',3),('TRR','Toán rời rạc',2),('TA','Tiếng Anh',2);
INSERT INTO KETQUA VALUES('A1','CSDL',20241,8.0),('A1','MMT',20241,7.5),('A1','HDH',20242,9.0),('A1','TRR',20242,6.5),('A1','TA',20242,8.5),('A2','CSDL',20241,4.0),('A2','CSDL',20242,7.0),('A2','MMT',20241,6.0),('A3','MMT',20241,3.5),('A3','MMT',20242,3.0),('A3','MMT',20251,6.5),('A3','HDH',20242,7.0),('A4','TRR',20241,9.5),('A4','TA',20241,8.0),('A5','CSDL',20242,9.0);`,
hidden:`INSERT INTO SINHVIEN VALUES('A6','Quân','K67');
INSERT INTO MONHOC VALUES('KTPM','Kỹ thuật phần mềm',4);
INSERT INTO KETQUA VALUES('A1','KTPM',20251,7.0),('A4','CSDL',20251,5.0),('A6','MMT',20251,5.0),('A6','MMT',20252,6.0);`,
parts:[
{t:"Liệt kê TenMon, SoTC của các môn từ 3 tín chỉ trở lên, sắp giảm dần theo SoTC, cùng SoTC thì tăng dần theo TenMon.",h:"ORDER BY hai cột.",ord:1,sql:"SELECT TenMon, SoTC FROM MONHOC WHERE SoTC>=3 ORDER BY SoTC DESC, TenMon"},
{t:"Với mỗi sinh viên đã có kết quả, cho biết MaSV và DiemTB (trung bình trên mọi lần học).",h:"AVG và GROUP BY. Hệ thống so sánh tới 2 chữ số thập phân.",sql:"SELECT MaSV, AVG(Diem) AS DiemTB FROM KETQUA GROUP BY MaSV"},
{t:"Tìm các trường hợp học lại: MaSV, MaMon, SoLan với SoLan là số lần học môn đó và SoLan từ 2 trở lên.",h:"GROUP BY theo cặp (MaSV, MaMon).",sql:"SELECT MaSV, MaMon, COUNT(*) AS SoLan FROM KETQUA GROUP BY MaSV, MaMon HAVING COUNT(*)>=2"},
{t:"Tìm MaSV, HoTen của sinh viên chưa từng học môn có mã CSDL.",h:"Lọc trong truy vấn con, không lọc MaMon<>'CSDL' trên từng dòng.",sql:"SELECT MaSV, HoTen FROM SINHVIEN WHERE MaSV NOT IN (SELECT MaSV FROM KETQUA WHERE MaMon='CSDL')"},
{t:"Tìm MaSV, HoTen của sinh viên đã học TẤT CẢ các môn trong MONHOC.",h:"Phép chia: NOT EXISTS lồng nhau, hoặc đếm số môn khác nhau.",sql:"SELECT sv.MaSV, sv.HoTen FROM SINHVIEN sv WHERE NOT EXISTS (SELECT 1 FROM MONHOC m WHERE NOT EXISTS (SELECT 1 FROM KETQUA k WHERE k.MaSV=sv.MaSV AND k.MaMon=m.MaMon))"},
]},
{title:"Bán hàng", story:"Đơn giá thực bán được lưu ở CHITIET.DonGiaBan, có thể khác giá niêm yết SANPHAM.DonGia.",
schema:`CREATE TABLE KHACHHANG(MaKH TEXT PRIMARY KEY, TenKH TEXT, ThanhPho TEXT);
CREATE TABLE SANPHAM(MaSP TEXT PRIMARY KEY, TenSP TEXT, LoaiSP TEXT, DonGia INT);
CREATE TABLE DONHANG(MaDH TEXT PRIMARY KEY, MaKH TEXT REFERENCES KHACHHANG(MaKH), NgayDat TEXT);
CREATE TABLE CHITIET(MaDH TEXT REFERENCES DONHANG(MaDH), MaSP TEXT REFERENCES SANPHAM(MaSP), SoLuong INT, DonGiaBan INT, PRIMARY KEY(MaDH,MaSP));`,
seed:`INSERT INTO KHACHHANG VALUES('K1','An','HN'),('K2','Bảo','HCM'),('K3','Cúc','HN'),('K4','Dương','DN');
INSERT INTO SANPHAM VALUES('P1','Bút','VanPhong',5000),('P2','Vở','VanPhong',12000),('P3','Chuột','DienTu',150000),('P4','Bàn phím','DienTu',300000),('P5','Tai nghe','DienTu',200000);
INSERT INTO DONHANG VALUES('D1','K1','2025-09-28'),('D2','K1','2025-10-05'),('D3','K2','2025-10-15'),('D4','K3','2025-10-31'),('D5','K2','2025-11-02');
INSERT INTO CHITIET VALUES('D1','P1',10,5000),('D1','P3',1,140000),('D2','P2',5,12000),('D3','P4',1,300000),('D3','P1',2,5000),('D4','P3',2,150000),('D5','P2',1,12000);`,
hidden:`INSERT INTO SANPHAM VALUES('P6','Loa','DienTu',500000);
INSERT INTO DONHANG VALUES('D6','K4','2025-10-20');
INSERT INTO CHITIET VALUES('D6','P5',2,200000);`,
parts:[
{t:"Liệt kê MaDH, NgayDat của các đơn đặt trong tháng 10/2025, sắp tăng dần theo NgayDat.",h:"Ngày lưu dạng 'YYYY-MM-DD'; có thể dùng BETWEEN, LIKE hoặc YEAR/MONTH.",ord:1,sql:"SELECT MaDH, NgayDat FROM DONHANG WHERE NgayDat BETWEEN '2025-10-01' AND '2025-10-31' ORDER BY NgayDat"},
{t:"Tính TongTien của từng đơn: MaDH, TongTien (SoLuong × DonGiaBan).",h:"SUM biểu thức, GROUP BY MaDH.",sql:"SELECT MaDH, SUM(SoLuong*DonGiaBan) AS TongTien FROM CHITIET GROUP BY MaDH"},
{t:"Tìm khách hàng có từ 2 đơn hàng trở lên: TenKH, SoDon.",h:"GROUP BY MaKH để không gộp nhầm khách trùng tên.",sql:"SELECT k.TenKH, COUNT(*) AS SoDon FROM KHACHHANG k JOIN DONHANG d ON k.MaKH=d.MaKH GROUP BY k.MaKH, k.TenKH HAVING COUNT(*)>=2"},
{t:"Tìm MaSP, TenSP của các sản phẩm chưa từng được bán.",h:"EXCEPT, NOT EXISTS hoặc LEFT JOIN ... IS NULL.",sql:"SELECT MaSP, TenSP FROM SANPHAM p WHERE NOT EXISTS (SELECT 1 FROM CHITIET c WHERE c.MaSP=p.MaSP)"},
{t:"Tìm (các) khách có tổng chi tiêu cao nhất: TenKH, TongChi. Nếu đồng hạng phải liệt kê tất cả.",h:"Tính tổng theo khách, so sánh với MAX của các tổng.",sql:"SELECT k.TenKH, SUM(c.SoLuong*c.DonGiaBan) AS TongChi FROM KHACHHANG k JOIN DONHANG d ON k.MaKH=d.MaKH JOIN CHITIET c ON d.MaDH=c.MaDH GROUP BY k.MaKH, k.TenKH HAVING SUM(c.SoLuong*c.DonGiaBan)=(SELECT MAX(t) FROM (SELECT SUM(c2.SoLuong*c2.DonGiaBan) AS t FROM DONHANG d2 JOIN CHITIET c2 ON d2.MaDH=c2.MaDH GROUP BY d2.MaKH) x)"},
]},
{title:"Nhân sự & dự án", story:"Lương tính bằng triệu đồng. MaQL trỏ tới chính NHANVIEN; NULL nếu không có quản lý.",
schema:`CREATE TABLE PHONGBAN(MaPB TEXT PRIMARY KEY, TenPB TEXT);
CREATE TABLE NHANVIEN(MaNV TEXT PRIMARY KEY, HoTen TEXT, MaPB TEXT REFERENCES PHONGBAN(MaPB), Luong INT, MaQL TEXT REFERENCES NHANVIEN(MaNV));
CREATE TABLE DUAN(MaDA TEXT PRIMARY KEY, TenDA TEXT, MaPB TEXT REFERENCES PHONGBAN(MaPB));
CREATE TABLE PHANCONG(MaNV TEXT REFERENCES NHANVIEN(MaNV), MaDA TEXT REFERENCES DUAN(MaDA), SoGio INT, PRIMARY KEY(MaNV,MaDA));`,
seed:`INSERT INTO PHONGBAN VALUES('P1','Kỹ thuật'),('P2','Nhân sự'),('P3','Marketing');
INSERT INTO NHANVIEN VALUES('N1','Hùng','P1',30,NULL),('N2','Lan','P1',20,'N1'),('N3','Mai','P1',12,'N2'),('N4','Nam','P2',18,'N1'),('N5','Oanh','P2',10,'N4');
INSERT INTO DUAN VALUES('D1','Web','P1'),('D2','App','P1'),('D3','CRM','P2');
INSERT INTO PHANCONG VALUES('N2','D1',10),('N2','D2',8),('N3','D1',5),('N4','D3',7),('N5','D1',3),('N1','D2',4);`,
hidden:`INSERT INTO NHANVIEN VALUES('N6','Quý','P3',25,'N1'),('N7','Sơn','P2',15,NULL);
INSERT INTO DUAN VALUES('D4','Mobile','P3');
INSERT INTO PHANCONG VALUES('N3','D2',2),('N6','D4',6);`,
parts:[
{t:"Liệt kê HoTen, Luong của nhân viên có lương trên 15, sắp giảm dần theo Luong.",h:"WHERE, ORDER BY DESC.",ord:1,sql:"SELECT HoTen, Luong FROM NHANVIEN WHERE Luong>15 ORDER BY Luong DESC"},
{t:"Với mỗi nhân viên có người quản lý, cho biết NhanVien (họ tên nhân viên) và QuanLy (họ tên người quản lý).",h:"Tự kết NHANVIEN với chính nó bằng hai bí danh.",sql:"SELECT nv.HoTen AS NhanVien, ql.HoTen AS QuanLy FROM NHANVIEN nv JOIN NHANVIEN ql ON nv.MaQL=ql.MaNV"},
{t:"Với MỌI phòng ban, kể cả phòng chưa có nhân viên, cho biết TenPB và SoNV.",h:"LEFT JOIN và COUNT(cột phía phải), không dùng COUNT(*).",sql:"SELECT p.TenPB, COUNT(n.MaNV) AS SoNV FROM PHONGBAN p LEFT JOIN NHANVIEN n ON p.MaPB=n.MaPB GROUP BY p.MaPB, p.TenPB"},
{t:"Tìm HoTen, Luong của nhân viên có lương cao hơn lương trung bình của phòng mình.",h:"Truy vấn con tương quan theo MaPB.",sql:"SELECT HoTen, Luong FROM NHANVIEN n WHERE Luong>(SELECT AVG(Luong) FROM NHANVIEN x WHERE x.MaPB=n.MaPB)"},
{t:"Tìm MaNV, HoTen của nhân viên tham gia TẤT CẢ dự án do phòng P1 phụ trách.",h:"Phép chia trên tập dự án của P1.",sql:"SELECT n.MaNV, n.HoTen FROM NHANVIEN n WHERE NOT EXISTS (SELECT 1 FROM DUAN d WHERE d.MaPB='P1' AND NOT EXISTS (SELECT 1 FROM PHANCONG c WHERE c.MaNV=n.MaNV AND c.MaDA=d.MaDA))"},
]},
{title:"Bệnh viện", story:"Một bệnh nhân khám nhiều lần; mỗi lần khám có thể kê nhiều thuốc.",
schema:`CREATE TABLE BACSI(MaBS TEXT PRIMARY KEY, TenBS TEXT, ChuyenKhoa TEXT);
CREATE TABLE BENHNHAN(MaBN TEXT PRIMARY KEY, TenBN TEXT, NamSinh INT);
CREATE TABLE LANKHAM(MaLK INT PRIMARY KEY, MaBN TEXT REFERENCES BENHNHAN(MaBN), MaBS TEXT REFERENCES BACSI(MaBS), NgayKham TEXT, ChanDoan TEXT);
CREATE TABLE THUOC(MaThuoc TEXT PRIMARY KEY, TenThuoc TEXT, Gia INT);
CREATE TABLE KETHUOC(MaLK INT REFERENCES LANKHAM(MaLK), MaThuoc TEXT REFERENCES THUOC(MaThuoc), SoLuong INT, PRIMARY KEY(MaLK,MaThuoc));`,
seed:`INSERT INTO BACSI VALUES('B1','Anh','Nội'),('B2','Bình','Ngoại'),('B3','Cường','Nhi');
INSERT INTO BENHNHAN VALUES('BN1','Tú',1965),('BN2','Vy',1980),('BN3','Xuân',1968),('BN4','Yến',2001);
INSERT INTO LANKHAM VALUES(1,'BN1','B1','2025-01-10','Cao huyết áp'),(2,'BN1','B1','2025-03-10','Tái khám'),(3,'BN2','B1','2025-02-01','Cảm cúm'),(4,'BN3','B2','2025-02-15','Viêm họng'),(5,'BN1','B2','2025-04-20','Đau đầu');
INSERT INTO THUOC VALUES('T1','Paracetamol',2),('T2','Amlodipin',10),('T3','Amoxicillin',8),('T4','Vitamin C',3);
INSERT INTO KETHUOC VALUES(1,'T2',30),(2,'T2',30),(3,'T1',10),(4,'T1',6),(4,'T3',14),(5,'T1',5);`,
hidden:`INSERT INTO LANKHAM VALUES(6,'BN4','B3','2025-05-01','Sốt'),(7,'BN2','B2','2025-05-02','Mất ngủ');
INSERT INTO KETHUOC VALUES(3,'T2',5),(4,'T2',5),(6,'T2',5);
INSERT INTO BACSI VALUES('B4','Dung','Mắt');`,
parts:[
{t:"Liệt kê TenBN, NamSinh của bệnh nhân sinh trước năm 1970, sắp tăng dần theo NamSinh.",h:"WHERE và ORDER BY.",ord:1,sql:"SELECT TenBN, NamSinh FROM BENHNHAN WHERE NamSinh<1970 ORDER BY NamSinh"},
{t:"Lịch sử khám của bệnh nhân BN1: NgayKham, TenBS, ChanDoan, sắp giảm dần theo NgayKham.",h:"Kết LANKHAM với BACSI.",ord:1,sql:"SELECT l.NgayKham, b.TenBS, l.ChanDoan FROM LANKHAM l JOIN BACSI b ON l.MaBS=b.MaBS WHERE l.MaBN='BN1' ORDER BY l.NgayKham DESC"},
{t:"Với mỗi bác sĩ đã từng khám, cho biết TenBS, SoLanKham và SoBenhNhan (số bệnh nhân khác nhau).",h:"COUNT(*) và COUNT(DISTINCT MaBN).",sql:"SELECT b.TenBS, COUNT(*) AS SoLanKham, COUNT(DISTINCT l.MaBN) AS SoBenhNhan FROM BACSI b JOIN LANKHAM l ON b.MaBS=l.MaBS GROUP BY b.MaBS, b.TenBS"},
{t:"Tìm MaBS, TenBS của bác sĩ chưa khám lần nào.",h:"NOT EXISTS hoặc LEFT JOIN ... IS NULL.",sql:"SELECT MaBS, TenBS FROM BACSI b WHERE NOT EXISTS (SELECT 1 FROM LANKHAM l WHERE l.MaBS=b.MaBS)"},
{t:"Tìm (các) thuốc được kê cho nhiều bệnh nhân khác nhau nhất: TenThuoc, SoBN. Nếu đồng hạng phải liệt kê tất cả.",h:"KETHUOC chưa có MaBN, phải kết thêm LANKHAM; đếm DISTINCT.",sql:"SELECT t.TenThuoc, COUNT(DISTINCT l.MaBN) AS SoBN FROM THUOC t JOIN KETHUOC k ON t.MaThuoc=k.MaThuoc JOIN LANKHAM l ON k.MaLK=l.MaLK GROUP BY t.MaThuoc, t.TenThuoc HAVING COUNT(DISTINCT l.MaBN)=(SELECT MAX(c) FROM (SELECT COUNT(DISTINCT l2.MaBN) AS c FROM KETHUOC k2 JOIN LANKHAM l2 ON k2.MaLK=l2.MaLK GROUP BY k2.MaThuoc) x)"},
]},
{title:"Rạp chiếu phim", story:"BatDau lưu dạng 'YYYY-MM-DD HH:MM'. Mỗi dòng VE là một vé đã bán.",
schema:`CREATE TABLE PHIM(MaPhim TEXT PRIMARY KEY, TenPhim TEXT, TheLoai TEXT, ThoiLuong INT);
CREATE TABLE PHONG(MaPhong TEXT PRIMARY KEY, TenPhong TEXT, SucChua INT);
CREATE TABLE SUAT(MaSuat TEXT PRIMARY KEY, MaPhim TEXT REFERENCES PHIM(MaPhim), MaPhong TEXT REFERENCES PHONG(MaPhong), BatDau TEXT, GiaVe INT);
CREATE TABLE VE(MaSuat TEXT REFERENCES SUAT(MaSuat), SoGhe TEXT, PRIMARY KEY(MaSuat,SoGhe));`,
seed:`INSERT INTO PHIM VALUES('F1','Hành tinh đỏ','HanhDong',130),('F2','Mưa tháng sáu','TinhCam',105),('F3','Truy kích','HanhDong',118),('F4','Ngày xưa','HoatHinh',90);
INSERT INTO PHONG VALUES('R1','Phòng 1',6),('R2','Phòng 2',4);
INSERT INTO SUAT VALUES('S1','F1','R1','2025-11-15 18:00',80000),('S2','F2','R2','2025-11-15 18:00',70000),('S3','F3','R1','2025-11-15 21:00',90000),('S4','F1','R2','2025-11-16 19:00',80000);
INSERT INTO VE VALUES('S1','A1'),('S1','A2'),('S1','A3'),('S2','B1'),('S3','A1'),('S3','A2'),('S4','C1'),('S4','C2');`,
hidden:`INSERT INTO PHIM VALUES('F5','Bão lửa','HanhDong',140),('F6','Phim mới','TinhCam',100);
INSERT INTO SUAT VALUES('S5','F4','R1','2025-11-15 09:00',50000);
INSERT INTO VE VALUES('S5','A1'),('S5','A2'),('S5','A3'),('S5','A4');`,
parts:[
{t:"Liệt kê TenPhim, ThoiLuong của phim thể loại HanhDong có thời lượng từ 120 phút trở lên.",h:"Hai điều kiện với AND.",sql:"SELECT TenPhim, ThoiLuong FROM PHIM WHERE TheLoai='HanhDong' AND ThoiLuong>=120"},
{t:"Danh sách suất chiếu ngày 2025-11-15: TenPhim, TenPhong, BatDau; sắp tăng dần theo BatDau, cùng giờ thì tăng dần theo TenPhong.",h:"LIKE '2025-11-15%'.",ord:1,sql:"SELECT p.TenPhim, r.TenPhong, s.BatDau FROM SUAT s JOIN PHIM p ON s.MaPhim=p.MaPhim JOIN PHONG r ON s.MaPhong=r.MaPhong WHERE s.BatDau LIKE '2025-11-15%' ORDER BY s.BatDau, r.TenPhong"},
{t:"Tính doanh thu của từng phim đã bán được vé: TenPhim, DoanhThu.",h:"Mỗi dòng VE đóng góp GiaVe của suất tương ứng.",sql:"SELECT p.TenPhim, SUM(s.GiaVe) AS DoanhThu FROM VE v JOIN SUAT s ON v.MaSuat=s.MaSuat JOIN PHIM p ON s.MaPhim=p.MaPhim GROUP BY p.MaPhim, p.TenPhim"},
{t:"Tìm MaPhim, TenPhim của các phim chưa có suất chiếu nào.",h:"NOT IN hoặc NOT EXISTS.",sql:"SELECT MaPhim, TenPhim FROM PHIM WHERE MaPhim NOT IN (SELECT MaPhim FROM SUAT)"},
{t:"Tìm các suất đã bán từ 50% sức chứa trở lên: MaSuat, SoVe, SucChua.",h:"HAVING COUNT(*)*2 >= SucChua, tránh phép chia nguyên.",sql:"SELECT s.MaSuat, COUNT(*) AS SoVe, r.SucChua FROM SUAT s JOIN VE v ON s.MaSuat=v.MaSuat JOIN PHONG r ON s.MaPhong=r.MaPhong GROUP BY s.MaSuat, r.SucChua HAVING COUNT(*)*2>=r.SucChua"},
]},
{title:"Khách sạn", story:"Tiền phòng = SoDem × GiaNgay. Tiền dịch vụ = SoLan × Gia. Đơn vị: nghìn đồng.",
schema:`CREATE TABLE KHACH(MaKH TEXT PRIMARY KEY, TenKH TEXT, QuocTich TEXT);
CREATE TABLE PHONG(MaPhong TEXT PRIMARY KEY, LoaiPhong TEXT, GiaNgay INT);
CREATE TABLE DATPHONG(MaDat INT PRIMARY KEY, MaKH TEXT REFERENCES KHACH(MaKH), MaPhong TEXT REFERENCES PHONG(MaPhong), NgayNhan TEXT, SoDem INT);
CREATE TABLE DICHVU(MaDV TEXT PRIMARY KEY, TenDV TEXT, Gia INT);
CREATE TABLE SUDUNG(MaDat INT REFERENCES DATPHONG(MaDat), MaDV TEXT REFERENCES DICHVU(MaDV), SoLan INT, PRIMARY KEY(MaDat,MaDV));`,
seed:`INSERT INTO KHACH VALUES('K1','Lan','VN'),('K2','Tom','US'),('K3','Mai','VN'),('K4','Ken','JP');
INSERT INTO PHONG VALUES('101','Standard',500),('102','Standard',500),('201','VIP',1200),('202','VIP',1500);
INSERT INTO DATPHONG VALUES(1,'K1','101','2025-06-01',2),(2,'K2','201','2025-06-03',3),(3,'K1','201','2025-07-10',1),(4,'K3','102','2025-07-15',4);
INSERT INTO DICHVU VALUES('D1','Giặt ủi',50),('D2','Spa',300),('D3','Ăn sáng',100);
INSERT INTO SUDUNG VALUES(1,'D3',2),(2,'D2',1),(2,'D3',3);`,
hidden:`INSERT INTO PHONG VALUES('301','VIP',2000);
INSERT INTO DATPHONG VALUES(5,'K4','202','2025-08-01',2),(6,'K3','101','2025-08-05',1);
INSERT INTO SUDUNG VALUES(5,'D1',1),(5,'D2',2),(5,'D3',1);`,
parts:[
{t:"Liệt kê MaPhong, GiaNgay của các phòng VIP, sắp giảm dần theo GiaNgay.",h:"WHERE và ORDER BY DESC.",ord:1,sql:"SELECT MaPhong, GiaNgay FROM PHONG WHERE LoaiPhong='VIP' ORDER BY GiaNgay DESC"},
{t:"Với mỗi lượt đặt, cho biết MaDat, TenKH, TienPhong.",h:"Kết 3 bảng, tính SoDem*GiaNgay.",sql:"SELECT d.MaDat, k.TenKH, d.SoDem*p.GiaNgay AS TienPhong FROM DATPHONG d JOIN KHACH k ON d.MaKH=k.MaKH JOIN PHONG p ON d.MaPhong=p.MaPhong"},
{t:"Tìm khách có từ 2 lượt đặt trở lên: TenKH, SoLuot.",h:"GROUP BY và HAVING.",sql:"SELECT k.TenKH, COUNT(*) AS SoLuot FROM KHACH k JOIN DATPHONG d ON k.MaKH=d.MaKH GROUP BY k.MaKH, k.TenKH HAVING COUNT(*)>=2"},
{t:"Tìm MaPhong, LoaiPhong của các phòng chưa từng được đặt.",h:"LEFT JOIN ... IS NULL hoặc EXCEPT.",sql:"SELECT p.MaPhong, p.LoaiPhong FROM PHONG p LEFT JOIN DATPHONG d ON p.MaPhong=d.MaPhong WHERE d.MaDat IS NULL"},
{t:"Với MỌI lượt đặt, kể cả không dùng dịch vụ, tính MaDat, TongTien (tiền phòng + tiền dịch vụ).",h:"Cẩn thận: kết thẳng với SUDUNG rồi SUM tiền phòng sẽ cộng lặp. Dùng truy vấn con và COALESCE.",sql:"SELECT d.MaDat, d.SoDem*p.GiaNgay+COALESCE((SELECT SUM(s.SoLan*v.Gia) FROM SUDUNG s JOIN DICHVU v ON s.MaDV=v.MaDV WHERE s.MaDat=d.MaDat),0) AS TongTien FROM DATPHONG d JOIN PHONG p ON d.MaPhong=p.MaPhong"},
]},
{title:"Giải bóng đá", story:"Mỗi trận có đội nhà và đội khách, cùng tham chiếu bảng DOI. Thắng 3 điểm, hòa 1 điểm, thua 0 điểm.",
schema:`CREATE TABLE DOI(MaDoi TEXT PRIMARY KEY, TenDoi TEXT, ThanhPho TEXT);
CREATE TABLE CAUTHU(MaCT TEXT PRIMARY KEY, TenCT TEXT, MaDoi TEXT REFERENCES DOI(MaDoi), ViTri TEXT);
CREATE TABLE TRANDAU(MaTran TEXT PRIMARY KEY, DoiNha TEXT REFERENCES DOI(MaDoi), DoiKhach TEXT REFERENCES DOI(MaDoi), Ngay TEXT, BanNha INT, BanKhach INT);
CREATE TABLE BANTHANG(MaBT INT PRIMARY KEY, MaTran TEXT REFERENCES TRANDAU(MaTran), MaCT TEXT REFERENCES CAUTHU(MaCT), Phut INT);`,
seed:`INSERT INTO DOI VALUES('D1','Sao Đỏ','Hà Nội'),('D2','Sông Lam','Nghệ An'),('D3','Biển Xanh','Đà Nẵng'),('D4','Núi Cao','Lào Cai');
INSERT INTO CAUTHU VALUES('C1','Tuấn','D1','TienDao'),('C2','Hải','D1','TienVe'),('C3','Long','D2','TienDao'),('C4','Phong','D2','HauVe'),('C5','Khánh','D3','TienDao'),('C6','Minh','D3','ThuMon');
INSERT INTO TRANDAU VALUES('T1','D1','D2','2025-03-01',2,1),('T2','D2','D3','2025-03-08',1,1),('T3','D3','D1','2025-03-15',0,3);
INSERT INTO BANTHANG VALUES(1,'T1','C1',10),(2,'T1','C2',40),(3,'T1','C3',70),(4,'T2','C3',20),(5,'T2','C5',80),(6,'T3','C1',5),(7,'T3','C1',50),(8,'T3','C2',88);`,
hidden:`INSERT INTO DOI VALUES('D5','Rừng Xanh','Kon Tum');
INSERT INTO CAUTHU VALUES('C7','Bảo','D4','TienDao');
INSERT INTO TRANDAU VALUES('T4','D4','D1','2025-03-22',2,0),('T5','D2','D4','2025-03-29',2,2);
INSERT INTO BANTHANG VALUES(9,'T4','C7',12),(10,'T4','C7',60),(11,'T5','C7',33),(12,'T5','C3',41),(13,'T5','C4',77),(14,'T5','C7',90);`,
parts:[
{t:"Liệt kê TenCT, TenDoi của các cầu thủ vị trí TienDao, sắp tăng dần theo TenCT.",h:"Kết CAUTHU với DOI.",ord:1,sql:"SELECT c.TenCT, d.TenDoi FROM CAUTHU c JOIN DOI d ON c.MaDoi=d.MaDoi WHERE c.ViTri='TienDao' ORDER BY c.TenCT"},
{t:"Với mỗi trận, cho biết MaTran, TenNha (tên đội nhà), TenKhach (tên đội khách).",h:"Kết DOI hai lần với hai bí danh.",sql:"SELECT t.MaTran, n.TenDoi AS TenNha, k.TenDoi AS TenKhach FROM TRANDAU t JOIN DOI n ON t.DoiNha=n.MaDoi JOIN DOI k ON t.DoiKhach=k.MaDoi"},
{t:"Tìm (các) vua phá lưới: TenCT, SoBan. Nếu đồng hạng phải liệt kê tất cả.",h:"Đếm bàn theo cầu thủ, so với MAX của các số bàn.",sql:"SELECT c.TenCT, COUNT(*) AS SoBan FROM CAUTHU c JOIN BANTHANG b ON c.MaCT=b.MaCT GROUP BY c.MaCT, c.TenCT HAVING COUNT(*)=(SELECT MAX(s) FROM (SELECT COUNT(*) AS s FROM BANTHANG GROUP BY MaCT) x)"},
{t:"Tìm MaCT, TenCT của các cầu thủ chưa ghi bàn nào.",h:"NOT EXISTS.",sql:"SELECT MaCT, TenCT FROM CAUTHU c WHERE NOT EXISTS (SELECT 1 FROM BANTHANG b WHERE b.MaCT=c.MaCT)"},
{t:"Lập bảng xếp hạng cho MỌI đội, kể cả đội chưa đá: TenDoi, Diem; sắp giảm dần theo Diem, cùng Diem thì tăng dần theo TenDoi.",h:"UNION ALL điểm với vai đội nhà và vai đội khách, rồi LEFT JOIN từ DOI. CASE WHEN để tính điểm.",ord:1,sql:"SELECT d.TenDoi, COALESCE(SUM(k.Diem),0) AS Diem FROM DOI d LEFT JOIN (SELECT DoiNha AS MaDoi, CASE WHEN BanNha>BanKhach THEN 3 WHEN BanNha=BanKhach THEN 1 ELSE 0 END AS Diem FROM TRANDAU UNION ALL SELECT DoiKhach, CASE WHEN BanKhach>BanNha THEN 3 WHEN BanKhach=BanNha THEN 1 ELSE 0 END FROM TRANDAU) k ON d.MaDoi=k.MaDoi GROUP BY d.MaDoi, d.TenDoi ORDER BY Diem DESC, d.TenDoi"},
]},
{title:"Hàng không", story:"Mỗi chuyến bay đi từ TuSB tới DenSB, cùng tham chiếu SANBAY. Giá vé tính bằng nghìn đồng.",
schema:`CREATE TABLE SANBAY(MaSB TEXT PRIMARY KEY, TenSB TEXT, ThanhPho TEXT);
CREATE TABLE CHUYENBAY(MaCB TEXT PRIMARY KEY, TuSB TEXT REFERENCES SANBAY(MaSB), DenSB TEXT REFERENCES SANBAY(MaSB), NgayBay TEXT, GiaVe INT);
CREATE TABLE HANHKHACH(MaHK TEXT PRIMARY KEY, TenHK TEXT, QuocTich TEXT);
CREATE TABLE DATCHO(MaCB TEXT REFERENCES CHUYENBAY(MaCB), MaHK TEXT REFERENCES HANHKHACH(MaHK), HangGhe TEXT, PRIMARY KEY(MaCB,MaHK));`,
seed:`INSERT INTO SANBAY VALUES('HAN','Nội Bài','Hà Nội'),('SGN','Tân Sơn Nhất','TP.HCM'),('DAD','Đà Nẵng','Đà Nẵng'),('PQC','Phú Quốc','Phú Quốc');
INSERT INTO CHUYENBAY VALUES('VN1','SGN','HAN','2025-12-01',1500),('VN2','SGN','DAD','2025-12-02',900),('VN3','HAN','SGN','2025-12-03',1400),('VN4','HAN','DAD','2025-12-03',1000),('VN5','DAD','PQC','2025-12-05',1100);
INSERT INTO HANHKHACH VALUES('H1','An','VN'),('H2','Bob','US'),('H3','Chi','VN'),('H4','Dan','AU');
INSERT INTO DATCHO VALUES('VN1','H1','Eco'),('VN1','H2','Bus'),('VN2','H1','Eco'),('VN3','H3','Eco'),('VN4','H3','Bus'),('VN3','H2','Eco');`,
hidden:`INSERT INTO CHUYENBAY VALUES('VN6','HAN','PQC','2025-12-06',1800),('VN7','SGN','PQC','2025-12-07',800);
INSERT INTO HANHKHACH VALUES('H5','Em','VN');
INSERT INTO DATCHO VALUES('VN6','H3','Eco'),('VN2','H4','Eco'),('VN4','H2','Eco'),('VN6','H5','Bus');`,
parts:[
{t:"Liệt kê MaCB, DenSB, GiaVe của các chuyến xuất phát từ SGN, sắp tăng dần theo GiaVe.",h:"WHERE và ORDER BY.",ord:1,sql:"SELECT MaCB, DenSB, GiaVe FROM CHUYENBAY WHERE TuSB='SGN' ORDER BY GiaVe"},
{t:"Với mỗi chuyến, cho biết MaCB, ThanhPhoDi, ThanhPhoDen.",h:"Kết SANBAY hai lần.",sql:"SELECT c.MaCB, a.ThanhPho AS ThanhPhoDi, b.ThanhPho AS ThanhPhoDen FROM CHUYENBAY c JOIN SANBAY a ON c.TuSB=a.MaSB JOIN SANBAY b ON c.DenSB=b.MaSB"},
{t:"Với MỌI chuyến, kể cả chuyến chưa có ai đặt, cho biết MaCB, SoHK.",h:"LEFT JOIN và COUNT(cột của DATCHO).",sql:"SELECT c.MaCB, COUNT(d.MaHK) AS SoHK FROM CHUYENBAY c LEFT JOIN DATCHO d ON c.MaCB=d.MaCB GROUP BY c.MaCB"},
{t:"Tìm MaHK, TenHK của hành khách chưa từng đặt chuyến nào xuất phát từ SGN.",h:"Truy vấn con kết DATCHO với CHUYENBAY.",sql:"SELECT MaHK, TenHK FROM HANHKHACH h WHERE NOT EXISTS (SELECT 1 FROM DATCHO d JOIN CHUYENBAY c ON d.MaCB=c.MaCB WHERE d.MaHK=h.MaHK AND c.TuSB='SGN')"},
{t:"Tìm MaHK, TenHK của hành khách đã đặt TẤT CẢ các chuyến xuất phát từ HAN.",h:"Phép chia trên tập chuyến từ HAN.",sql:"SELECT h.MaHK, h.TenHK FROM HANHKHACH h WHERE NOT EXISTS (SELECT 1 FROM CHUYENBAY c WHERE c.TuSB='HAN' AND NOT EXISTS (SELECT 1 FROM DATCHO d WHERE d.MaCB=c.MaCB AND d.MaHK=h.MaHK))"},
]},
{title:"Cung ứng vật tư (liên kết 3 ngôi)", story:"CUNGUNG là bảng nối 3 ngôi giữa nhà cung cấp, vật tư và dự án.",
schema:`CREATE TABLE NHACC(MaNCC TEXT PRIMARY KEY, TenNCC TEXT, ThanhPho TEXT);
CREATE TABLE VATTU(MaVT TEXT PRIMARY KEY, TenVT TEXT, MauSac TEXT);
CREATE TABLE DUAN(MaDA TEXT PRIMARY KEY, TenDA TEXT, ThanhPho TEXT);
CREATE TABLE CUNGUNG(MaNCC TEXT REFERENCES NHACC(MaNCC), MaVT TEXT REFERENCES VATTU(MaVT), MaDA TEXT REFERENCES DUAN(MaDA), SoLuong INT, PRIMARY KEY(MaNCC,MaVT,MaDA));`,
seed:`INSERT INTO NHACC VALUES('N1','Phát','HN'),('N2','Thịnh','HCM'),('N3','Hòa','HN'),('N4','An','DN');
INSERT INTO VATTU VALUES('V1','Thép','Xam'),('V2','Sơn','Do'),('V3','Gạch','Do'),('V4','Kính','Trang');
INSERT INTO DUAN VALUES('A1','Cầu','HN'),('A2','Trường','HCM'),('A3','Nhà máy','DN');
INSERT INTO CUNGUNG VALUES('N1','V1','A1',300),('N1','V2','A1',100),('N1','V3','A2',250),('N2','V2','A2',200),('N2','V4','A2',50),('N3','V1','A3',150),('N3','V3','A1',120);`,
hidden:`INSERT INTO NHACC VALUES('N5','Bình','HN');
INSERT INTO VATTU VALUES('V5','Ngói','Do');
INSERT INTO CUNGUNG VALUES('N1','V5','A3',80),('N2','V3','A2',60),('N5','V1','A2',10),('N2','V4','A3',300);`,
parts:[
{t:"Liệt kê TenNCC của nhà cung cấp ở HN, sắp tăng dần theo TenNCC.",h:"WHERE và ORDER BY.",ord:1,sql:"SELECT TenNCC FROM NHACC WHERE ThanhPho='HN' ORDER BY TenNCC"},
{t:"Cho biết TenNCC, TenVT, TenDA, SoLuong của các lần cung ứng có SoLuong từ 200 trở lên.",h:"Kết 4 bảng.",sql:"SELECT n.TenNCC, v.TenVT, d.TenDA, c.SoLuong FROM CUNGUNG c JOIN NHACC n ON c.MaNCC=n.MaNCC JOIN VATTU v ON c.MaVT=v.MaVT JOIN DUAN d ON c.MaDA=d.MaDA WHERE c.SoLuong>=200"},
{t:"Tìm vật tư có tổng số lượng cung ứng trên 300: MaVT, TongSL.",h:"SUM và HAVING.",sql:"SELECT MaVT, SUM(SoLuong) AS TongSL FROM CUNGUNG GROUP BY MaVT HAVING SUM(SoLuong)>300"},
{t:"Tìm MaNCC, TenNCC của nhà cung cấp chưa từng cung ứng vật tư màu Do.",h:"Truy vấn con kết CUNGUNG với VATTU.",sql:"SELECT MaNCC, TenNCC FROM NHACC n WHERE MaNCC NOT IN (SELECT c.MaNCC FROM CUNGUNG c JOIN VATTU v ON c.MaVT=v.MaVT WHERE v.MauSac='Do')"},
{t:"Tìm MaNCC, TenNCC của nhà cung cấp đã cung ứng TẤT CẢ vật tư màu Do.",h:"Phép chia; một vật tư có thể cung ứng cho nhiều dự án nên nếu đếm phải COUNT DISTINCT.",sql:"SELECT n.MaNCC, n.TenNCC FROM NHACC n WHERE NOT EXISTS (SELECT 1 FROM VATTU v WHERE v.MauSac='Do' AND NOT EXISTS (SELECT 1 FROM CUNGUNG c WHERE c.MaNCC=n.MaNCC AND c.MaVT=v.MaVT))"},
]},
];
