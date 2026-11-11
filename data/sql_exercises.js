// 14 bài thực hành, bám theo lược đồ và dạng truy vấn trong đề đã thu thập.
(function () {
var UNI = {
schema:`CREATE TABLE STUDENT(SID TEXT PRIMARY KEY, Name TEXT, Major TEXT, GPA REAL);
CREATE TABLE COURSE(CID TEXT PRIMARY KEY, Title TEXT, Dept TEXT, Credits INT);
CREATE TABLE ENROLL(SID TEXT REFERENCES STUDENT(SID), CID TEXT REFERENCES COURSE(CID), Semester TEXT, Grade TEXT, PRIMARY KEY(SID,CID,Semester));
CREATE TABLE INSTRUCTOR(IID TEXT PRIMARY KEY, IName TEXT, Office TEXT);
CREATE TABLE ROOM(Room TEXT PRIMARY KEY, Building TEXT);
CREATE TABLE TEACH(IID TEXT REFERENCES INSTRUCTOR(IID), CID TEXT REFERENCES COURSE(CID), Semester TEXT, Room TEXT REFERENCES ROOM(Room), PRIMARY KEY(IID,CID,Semester));
CREATE TABLE ADVISE(IID TEXT REFERENCES INSTRUCTOR(IID), SID TEXT REFERENCES STUDENT(SID), PRIMARY KEY(IID,SID));
CREATE TABLE CLUB(ClubID TEXT PRIMARY KEY, ClubName TEXT);
CREATE TABLE MEMBER(SID TEXT REFERENCES STUDENT(SID), ClubID TEXT REFERENCES CLUB(ClubID), PRIMARY KEY(SID,ClubID));
CREATE TABLE PREREQ(CID TEXT REFERENCES COURSE(CID), PreCID TEXT REFERENCES COURSE(CID), PRIMARY KEY(CID,PreCID));`,
seed:`INSERT INTO STUDENT VALUES('S01','An','CS',3.6),('S02','Bình','CS',2.8),('S03','Chi','IS',3.2),('S04','Dũng','SE',3.9),('S05','Hà','AI',2.5),('S06','Khoa','IS',3.0),('S07','Lan','CS',3.4),('S08','Giang','IS',3.1);
INSERT INTO COURSE VALUES('C01','Database','CS',4),('C02','AI','CS',3),('C03','Networks','IS',3),('C04','OS','CS',4),('C05','Web','SE',2),('C06','Statistics','IS',3),('C07','Compiler','CS',4);
INSERT INTO ENROLL VALUES('S01','C01','2025_Spring','A'),('S01','C05','2025_Spring','B'),('S01','C02','2025_Fall','B'),('S02','C01','2025_Spring','F'),('S02','C03','2025_Fall','C'),('S03','C03','2025_Spring','B'),('S03','C01','2025_Fall','A'),('S04','C02','2025_Spring','A'),('S04','C05','2025_Fall','A'),('S05','C06','2025_Fall',NULL),('S06','C03','2025_Spring','F'),('S06','C06','2025_Fall','B'),('S07','C01','2025_Fall','B'),('S07','C04','2025_Fall',NULL),('S08','C03','2025_Spring','C');
INSERT INTO INSTRUCTOR VALUES('I01','Hùng','A101'),('I02','Mai','A102'),('I03','Nam','B201'),('I04','Oanh','B202'),('I05','Phúc','C301');
INSERT INTO ROOM VALUES('R1','A'),('R2','B'),('R3','A');
INSERT INTO TEACH VALUES('I01','C01','2025_Spring','R1'),('I01','C01','2025_Fall','R1'),('I02','C02','2025_Fall','R2'),('I02','C04','2025_Fall','R3'),('I03','C03','2025_Spring','R3'),('I03','C03','2025_Fall','R2'),('I04','C06','2025_Fall','R1');
INSERT INTO ADVISE VALUES('I01','S01'),('I01','S02'),('I02','S03'),('I02','S04'),('I03','S05'),('I03','S06');
INSERT INTO CLUB VALUES('K1','AI'),('K2','Robotics'),('K3','Music'),('K4','Chess');
INSERT INTO MEMBER VALUES('S01','K1'),('S01','K2'),('S02','K1'),('S03','K2'),('S04','K1'),('S04','K2'),('S05','K3');
INSERT INTO PREREQ VALUES('C02','C01'),('C04','C03'),('C07','C04'),('C05','C01');`,
hidden:`INSERT INTO STUDENT VALUES('S09','Yến','SE',3.7),('S10','Tú','CS',3.3);
INSERT INTO COURSE VALUES('C08','Security','SE',4),('C09','DataMining','IS',3);
INSERT INTO ENROLL VALUES('S06','C09','2025_Spring','A'),('S08','C06','2025_Fall','A'),('S08','C09','2025_Fall','B'),('S09','C02','2025_Spring','B'),('S09','C01','2025_Spring','A'),('S09','C07','2025_Fall','F'),('S05','C02','2025_Spring',NULL),('S07','C02','2025_Spring','A');
INSERT INTO TEACH VALUES('I05','C08','2025_Fall','R2'),('I04','C07','2025_Fall','R3');
INSERT INTO ADVISE VALUES('I05','S09'),('I04','S07');
INSERT INTO MEMBER VALUES('S07','K4'),('S10','K1'),('S03','K1');
INSERT INTO PREREQ VALUES('C08','C02');`};
function uni(title, story, parts) { return { title: title, story: story, schema: UNI.schema, seed: UNI.seed, hidden: UNI.hidden, parts: parts }; }
var S = "2025_Spring", F = "2025_Fall";
window.SQLX = [
uni("Trường học 1: chọn và chiếu", "Lược đồ chung của đề: STUDENT, COURSE, ENROLL, INSTRUCTOR, TEACH, ROOM, ADVISE, CLUB, MEMBER, PREREQ. Grade có thể NULL.", [
{t:"Lấy Name, GPA của sinh viên Major='CS' có GPA ≥ 3.0, sắp giảm dần theo GPA.",h:"Hai điều kiện với AND.",ord:1,sql:"SELECT Name, GPA FROM STUDENT WHERE Major='CS' AND GPA>=3.0 ORDER BY GPA DESC"},
{t:"Lấy các giá trị Major khác nhau của sinh viên.",h:"DISTINCT.",sql:"SELECT DISTINCT Major FROM STUDENT"},
{t:"Lấy CID, Title của các môn Dept='CS' có Credits ≥ 4.",h:"WHERE với AND.",sql:"SELECT CID, Title FROM COURSE WHERE Dept='CS' AND Credits>=4"},
{t:"Lấy CID của các môn không thuộc Dept='CS' có Credits ≤ 3, sắp tăng dần theo CID.",h:"Dept<>'CS'.",ord:1,sql:"SELECT CID FROM COURSE WHERE Dept<>'CS' AND Credits<=3 ORDER BY CID"},
{t:"Lấy (SID, CID) của các đăng ký chưa có điểm.",h:"Grade IS NULL, không dùng Grade = NULL.",sql:"SELECT SID, CID FROM ENROLL WHERE Grade IS NULL"},
]),
uni("Trường học 2: kết nhiều bảng", "Mỗi phần tương ứng một biểu thức π(σ(... ⋈ ...)).", [
{t:"Lấy Name của sinh viên đăng ký môn có Title là 'Database' (không trùng).",h:"STUDENT ⋈ ENROLL ⋈ COURSE, dùng DISTINCT.",sql:"SELECT DISTINCT s.Name FROM STUDENT s JOIN ENROLL e ON s.SID=e.SID JOIN COURSE c ON e.CID=c.CID WHERE c.Title='Database'"},
{t:"Lấy (SID, Name) của sinh viên đăng ký môn có Credits ≥ 4 trong Semester='"+F+"' (không trùng).",h:"Credits ở COURSE, Semester ở ENROLL.",sql:"SELECT DISTINCT s.SID, s.Name FROM STUDENT s JOIN ENROLL e ON s.SID=e.SID JOIN COURSE c ON e.CID=c.CID WHERE c.Credits>=4 AND e.Semester='"+F+"'"},
{t:"Lấy CID của các môn có sinh viên Major='CS' đăng ký trong Semester='"+S+"' (không trùng).",h:"Kết STUDENT với ENROLL.",sql:"SELECT DISTINCT e.CID FROM STUDENT s JOIN ENROLL e ON s.SID=e.SID WHERE s.Major='CS' AND e.Semester='"+S+"'"},
{t:"Lấy Title của các môn Dept<>'CS' nhưng có ít nhất một sinh viên Major='CS' đăng ký (không trùng).",h:"Kết 3 bảng, hai điều kiện AND.",sql:"SELECT DISTINCT c.Title FROM STUDENT s JOIN ENROLL e ON s.SID=e.SID JOIN COURSE c ON e.CID=c.CID WHERE s.Major='CS' AND c.Dept<>'CS'"},
{t:"Lấy Name của sinh viên Major<>'CS' đã đăng ký ít nhất một môn Dept='CS' (không trùng).",h:"Kết 3 bảng, hai điều kiện AND.",sql:"SELECT DISTINCT s.Name FROM STUDENT s JOIN ENROLL e ON s.SID=e.SID JOIN COURSE c ON e.CID=c.CID WHERE s.Major<>'CS' AND c.Dept='CS'"},
]),
uni("Trường học 3: dạng “cả hai”", "Một dòng chỉ có một giá trị của mỗi cột, nên “cả hai” cần INTERSECT, EXISTS hoặc GROUP BY.", [
{t:"Lấy SID của sinh viên có đăng ký cả hai học kỳ '"+S+"' và '"+F+"' (không trùng).",h:"INTERSECT hai tập SID.",sql:"SELECT SID FROM ENROLL WHERE Semester='"+S+"' INTERSECT SELECT SID FROM ENROLL WHERE Semester='"+F+"'"},
{t:"Lấy SID của sinh viên đã đăng ký CẢ HAI môn 'Database' và 'AI' (không trùng).",h:"INTERSECT trên hai truy vấn kết với COURSE.",sql:"SELECT e.SID FROM ENROLL e JOIN COURSE c ON e.CID=c.CID WHERE c.Title='Database' INTERSECT SELECT e.SID FROM ENROLL e JOIN COURSE c ON e.CID=c.CID WHERE c.Title='AI'"},
{t:"Lấy Name của sinh viên là thành viên CẢ HAI CLB 'AI' và 'Robotics'.",h:"Giao hai tập SID rồi lấy Name.",sql:"SELECT Name FROM STUDENT WHERE SID IN (SELECT m.SID FROM MEMBER m JOIN CLUB k ON m.ClubID=k.ClubID WHERE k.ClubName='AI') AND SID IN (SELECT m.SID FROM MEMBER m JOIN CLUB k ON m.ClubID=k.ClubID WHERE k.ClubName='Robotics')"},
{t:"Lấy SID của sinh viên đã đăng ký ít nhất một môn Dept='CS' VÀ ít nhất một môn Dept='IS' (không trùng).",h:"Mỗi môn chỉ thuộc một Dept.",sql:"SELECT e.SID FROM ENROLL e JOIN COURSE c ON e.CID=c.CID WHERE c.Dept='CS' INTERSECT SELECT e.SID FROM ENROLL e JOIN COURSE c ON e.CID=c.CID WHERE c.Dept='IS'"},
{t:"Lấy IName của giảng viên dạy ít nhất một môn Dept='CS' trong '"+F+"' và cố vấn ít nhất một sinh viên Major='CS' (không trùng).",h:"Hai điều kiện độc lập, giao hai tập IID.",sql:"SELECT IName FROM INSTRUCTOR WHERE IID IN (SELECT t.IID FROM TEACH t JOIN COURSE c ON t.CID=c.CID WHERE c.Dept='CS' AND t.Semester='"+F+"') AND IID IN (SELECT a.IID FROM ADVISE a JOIN STUDENT s ON a.SID=s.SID WHERE s.Major='CS')"},
]),
uni("Trường học 4: dạng “không có”", "Tương ứng phép trừ trong đại số quan hệ: EXCEPT, NOT IN hoặc NOT EXISTS.", [
{t:"Lấy Title của các môn chưa có sinh viên nào đăng ký.",h:"Tập mọi môn trừ tập môn có trong ENROLL.",sql:"SELECT Title FROM COURSE WHERE CID NOT IN (SELECT CID FROM ENROLL)"},
{t:"Lấy Title của các môn thuộc Dept='CS' mà không có bất kỳ đăng ký nào.",h:"Thêm điều kiện Dept.",sql:"SELECT Title FROM COURSE c WHERE Dept='CS' AND NOT EXISTS (SELECT 1 FROM ENROLL e WHERE e.CID=c.CID)"},
{t:"Lấy (SID, Name) của sinh viên KHÔNG đăng ký trong Semester='"+S+"'.",h:"Điều kiện Semester<> sẽ giữ người có đăng ký thêm kỳ khác.",sql:"SELECT SID, Name FROM STUDENT WHERE SID NOT IN (SELECT SID FROM ENROLL WHERE Semester='"+S+"')"},
{t:"Lấy SID của sinh viên đăng ký trong '"+S+"' nhưng không đăng ký trong '"+F+"' (không trùng).",h:"EXCEPT hai tập SID.",sql:"SELECT SID FROM ENROLL WHERE Semester='"+S+"' EXCEPT SELECT SID FROM ENROLL WHERE Semester='"+F+"'"},
{t:"Lấy CID của các môn có ít nhất một đăng ký nhưng không có bản ghi nào Grade='F' (Grade có thể NULL) (không trùng).",h:"Không lọc Grade<>'F' trên từng dòng; hãy loại các môn có điểm F.",sql:"SELECT CID FROM ENROLL EXCEPT SELECT CID FROM ENROLL WHERE Grade='F'"},
]),
uni("Trường học 5: “chỉ” và “đúng một”", "Các truy vấn có bẫy loại trừ và hiệu đối xứng.", [
{t:"Lấy SID của sinh viên chỉ đăng ký các môn Dept='CS' (không đăng ký môn ngoài CS) (không trùng).",h:"Mọi sinh viên có đăng ký trừ sinh viên có môn ngoài CS.",sql:"SELECT SID FROM ENROLL EXCEPT SELECT e.SID FROM ENROLL e JOIN COURSE c ON e.CID=c.CID WHERE c.Dept<>'CS'"},
{t:"Lấy SID của sinh viên đăng ký đúng một trong hai môn 'Database' hoặc 'AI'.",h:"Hợp trừ giao, hoặc đếm DISTINCT Title bằng 1.",sql:"SELECT e.SID FROM ENROLL e JOIN COURSE c ON e.CID=c.CID WHERE c.Title IN ('Database','AI') GROUP BY e.SID HAVING COUNT(DISTINCT c.Title)=1"},
{t:"Lấy CID của các môn Dept='CS' có đăng ký trong '"+F+"' nhưng không có đăng ký trong '"+S+"' (không trùng).",h:"EXCEPT trên cùng điều kiện Dept.",sql:"SELECT e.CID FROM ENROLL e JOIN COURSE c ON e.CID=c.CID WHERE c.Dept='CS' AND e.Semester='"+F+"' EXCEPT SELECT CID FROM ENROLL WHERE Semester='"+S+"'"},
{t:"Lấy CID của các môn thuộc Dept='CS' hoặc Dept='SE' mà không có đăng ký trong '"+F+"' (không trùng).",h:"Tập môn của hai khoa trừ tập môn có đăng ký kỳ đó.",sql:"SELECT CID FROM COURSE WHERE Dept IN ('CS','SE') EXCEPT SELECT CID FROM ENROLL WHERE Semester='"+F+"'"},
{t:"Lấy Name của sinh viên chưa tham gia CLB nào.",h:"NOT EXISTS trên MEMBER.",sql:"SELECT Name FROM STUDENT s WHERE NOT EXISTS (SELECT 1 FROM MEMBER m WHERE m.SID=s.SID)"},
]),
uni("Trường học 6: giảng viên và phòng học", "Khai thác INSTRUCTOR, TEACH, ROOM, ADVISE.", [
{t:"Lấy IName của giảng viên đã dạy ít nhất một môn có Credits ≥ 4 (không trùng).",h:"INSTRUCTOR ⋈ TEACH ⋈ COURSE.",sql:"SELECT DISTINCT i.IName FROM INSTRUCTOR i JOIN TEACH t ON i.IID=t.IID JOIN COURSE c ON t.CID=c.CID WHERE c.Credits>=4"},
{t:"Lấy Title của các môn được dạy tại Building='A' trong Semester='"+F+"' (không trùng).",h:"Kết TEACH, ROOM, COURSE.",sql:"SELECT DISTINCT c.Title FROM TEACH t JOIN ROOM r ON t.Room=r.Room JOIN COURSE c ON t.CID=c.CID WHERE r.Building='A' AND t.Semester='"+F+"'"},
{t:"Lấy Title của các môn được đăng ký bởi sinh viên do giảng viên IID='I01' cố vấn (không trùng).",h:"ADVISE ⋈ ENROLL ⋈ COURSE.",sql:"SELECT DISTINCT c.Title FROM ADVISE a JOIN ENROLL e ON a.SID=e.SID JOIN COURSE c ON e.CID=c.CID WHERE a.IID='I01'"},
{t:"Lấy IName của giảng viên chưa dạy môn nào.",h:"NOT IN trên TEACH.",sql:"SELECT IName FROM INSTRUCTOR WHERE IID NOT IN (SELECT IID FROM TEACH)"},
{t:"Lấy (Room, Building) của các phòng được dùng trong Semester='"+F+"' (không trùng).",h:"Kết TEACH với ROOM, DISTINCT.",sql:"SELECT DISTINCT r.Room, r.Building FROM TEACH t JOIN ROOM r ON t.Room=r.Room WHERE t.Semester='"+F+"'"},
]),
uni("Trường học 7: tiên quyết và CLB", "PREREQ(CID, PreCID) chỉ chứa các môn có môn tiên quyết.", [
{t:"Lấy Title của các môn Dept='CS' có ít nhất một môn tiên quyết (không trùng).",h:"Kết COURSE với PREREQ theo CID.",sql:"SELECT DISTINCT c.Title FROM COURSE c JOIN PREREQ p ON c.CID=p.CID WHERE c.Dept='CS'"},
{t:"Với mỗi cặp tiên quyết, cho biết MonHoc (Title của môn) và TienQuyet (Title của môn tiên quyết).",h:"Kết COURSE hai lần với hai bí danh.",sql:"SELECT c.Title AS MonHoc, q.Title AS TienQuyet FROM PREREQ p JOIN COURSE c ON p.CID=c.CID JOIN COURSE q ON p.PreCID=q.CID"},
{t:"Lấy Title của các môn không có môn tiên quyết.",h:"NOT EXISTS trên PREREQ.",sql:"SELECT Title FROM COURSE c WHERE NOT EXISTS (SELECT 1 FROM PREREQ p WHERE p.CID=c.CID)"},
{t:"Lấy Name của sinh viên có GPA ≥ 3.5 và là thành viên CLB 'AI'.",h:"STUDENT ⋈ MEMBER ⋈ CLUB.",sql:"SELECT s.Name FROM STUDENT s JOIN MEMBER m ON s.SID=m.SID JOIN CLUB k ON m.ClubID=k.ClubID WHERE s.GPA>=3.5 AND k.ClubName='AI'"},
{t:"Với MỌI CLB, kể cả CLB chưa có thành viên, cho biết ClubName và SoThanhVien.",h:"LEFT JOIN và COUNT(cột của MEMBER).",sql:"SELECT k.ClubName, COUNT(m.SID) AS SoThanhVien FROM CLUB k LEFT JOIN MEMBER m ON k.ClubID=m.ClubID GROUP BY k.ClubID, k.ClubName"},
]),
uni("Trường học 8: gom nhóm và phép chia", "Các truy vấn tổng hợp và dạng “tất cả”.", [
{t:"Với MỌI môn, kể cả môn chưa ai đăng ký, cho biết Title và SoDangKy.",h:"LEFT JOIN và COUNT(e.SID).",sql:"SELECT c.Title, COUNT(e.SID) AS SoDangKy FROM COURSE c LEFT JOIN ENROLL e ON c.CID=e.CID GROUP BY c.CID, c.Title"},
{t:"Với mỗi Major, cho biết Major và GPA trung bình GpaTB.",h:"AVG và GROUP BY.",sql:"SELECT Major, AVG(GPA) AS GpaTB FROM STUDENT GROUP BY Major"},
{t:"Tìm sinh viên đăng ký từ 2 môn khác nhau trở lên: SID, SoMon.",h:"COUNT(DISTINCT CID).",sql:"SELECT SID, COUNT(DISTINCT CID) AS SoMon FROM ENROLL GROUP BY SID HAVING COUNT(DISTINCT CID)>=2"},
{t:"Lấy SID của sinh viên đã đăng ký TẤT CẢ các môn Dept='IS'.",h:"Phép chia: NOT EXISTS lồng nhau.",sql:"SELECT s.SID FROM STUDENT s WHERE NOT EXISTS (SELECT 1 FROM COURSE c WHERE c.Dept='IS' AND NOT EXISTS (SELECT 1 FROM ENROLL e WHERE e.SID=s.SID AND e.CID=c.CID))"},
{t:"Tìm (các) môn có nhiều lượt đăng ký nhất: Title, SoDangKy. Nếu đồng hạng phải liệt kê tất cả.",h:"So với MAX của các số lượt.",sql:"SELECT c.Title, COUNT(*) AS SoDangKy FROM COURSE c JOIN ENROLL e ON c.CID=e.CID GROUP BY c.CID, c.Title HAVING COUNT(*)=(SELECT MAX(n) FROM (SELECT COUNT(*) AS n FROM ENROLL GROUP BY CID) x)"},
]),
{title:"Vận chuyển (DRIVER, SHIPMENT, WAREHOUSE)", story:"Mỗi SHIPMENT thuộc một WAREHOUSE; DRIVER và SHIPMENT liên kết M–N qua DELIVERS.",
schema:`CREATE TABLE WAREHOUSE(WarehouseID TEXT PRIMARY KEY, City TEXT);
CREATE TABLE SHIPMENT(ShipmentID TEXT PRIMARY KEY, WarehouseID TEXT NOT NULL REFERENCES WAREHOUSE(WarehouseID), Weight INT);
CREATE TABLE DRIVER(DriverID TEXT PRIMARY KEY, DName TEXT);
CREATE TABLE DELIVERS(DriverID TEXT REFERENCES DRIVER(DriverID), ShipmentID TEXT REFERENCES SHIPMENT(ShipmentID), StartDate TEXT, VehicleType TEXT, PRIMARY KEY(DriverID,ShipmentID));`,
seed:`INSERT INTO WAREHOUSE VALUES('W1','Hà Nội'),('W2','Đà Nẵng'),('W3','Huế');
INSERT INTO SHIPMENT VALUES('H1','W1',80),('H2','W1',40),('H3','W2',55),('H4','W2',20);
INSERT INTO DRIVER VALUES('D1','An'),('D2','Bảo'),('D3','Cường');
INSERT INTO DELIVERS VALUES('D1','H1','2025-10-01','Truck'),('D1','H2','2025-10-02','Van'),('D2','H1','2025-10-03','Truck'),('D2','H3','2025-10-04','Truck');`,
hidden:`INSERT INTO WAREHOUSE VALUES('W4','Vinh');
INSERT INTO SHIPMENT VALUES('H5','W1',90),('H6','W3',60);
INSERT INTO DRIVER VALUES('D4','Dũng');
INSERT INTO DELIVERS VALUES('D1','H5','2025-10-05','Truck'),('D2','H5','2025-10-06','Van'),('D3','H6','2025-10-07','Van'),('D2','H2','2025-10-08','Van');`,
parts:[
{t:"Liệt kê ShipmentID, Weight của các lô từ 50 trở lên, sắp giảm dần theo Weight.",h:"WHERE và ORDER BY DESC.",ord:1,sql:"SELECT ShipmentID, Weight FROM SHIPMENT WHERE Weight>=50 ORDER BY Weight DESC"},
{t:"Với mỗi lần giao, cho biết DName, ShipmentID, City (thành phố của kho).",h:"Kết DELIVERS, DRIVER, SHIPMENT, WAREHOUSE.",sql:"SELECT d.DName, l.ShipmentID, w.City FROM DELIVERS l JOIN DRIVER d ON l.DriverID=d.DriverID JOIN SHIPMENT s ON l.ShipmentID=s.ShipmentID JOIN WAREHOUSE w ON s.WarehouseID=w.WarehouseID"},
{t:"Với MỌI tài xế, kể cả chưa giao lô nào, cho biết DName, SoLo.",h:"LEFT JOIN và COUNT(cột của DELIVERS).",sql:"SELECT d.DName, COUNT(l.ShipmentID) AS SoLo FROM DRIVER d LEFT JOIN DELIVERS l ON d.DriverID=l.DriverID GROUP BY d.DriverID, d.DName"},
{t:"Tìm WarehouseID, City của các kho chưa có lô hàng nào.",h:"NOT IN trên SHIPMENT.",sql:"SELECT WarehouseID, City FROM WAREHOUSE WHERE WarehouseID NOT IN (SELECT WarehouseID FROM SHIPMENT)"},
{t:"Tìm DriverID của tài xế đã giao TẤT CẢ các lô thuộc kho W1.",h:"Phép chia trên tập lô của W1.",sql:"SELECT d.DriverID FROM DRIVER d WHERE NOT EXISTS (SELECT 1 FROM SHIPMENT s WHERE s.WarehouseID='W1' AND NOT EXISTS (SELECT 1 FROM DELIVERS l WHERE l.DriverID=d.DriverID AND l.ShipmentID=s.ShipmentID))"},
]},
{title:"Chợ nông sản (3 ngôi, đa trị)", story:"SUPPLY là liên kết 3 ngôi; MARKET_PHONE là bảng tách từ thuộc tính đa trị.",
schema:`CREATE TABLE MARKET(MarketID TEXT PRIMARY KEY, MName TEXT);
CREATE TABLE MARKET_PHONE(MarketID TEXT REFERENCES MARKET(MarketID), PhoneNumber TEXT, PRIMARY KEY(MarketID,PhoneNumber));
CREATE TABLE FARMER(FarmerID TEXT PRIMARY KEY, FName TEXT);
CREATE TABLE CROP(CropID TEXT PRIMARY KEY, CName TEXT);
CREATE TABLE SUPPLY(FarmerID TEXT REFERENCES FARMER(FarmerID), CropID TEXT REFERENCES CROP(CropID), MarketID TEXT REFERENCES MARKET(MarketID), Price INT, PRIMARY KEY(FarmerID,CropID,MarketID));`,
seed:`INSERT INTO MARKET VALUES('M1','Chợ Đồng'),('M2','Chợ Bến'),('M3','Chợ Mới');
INSERT INTO MARKET_PHONE VALUES('M1','0901'),('M1','0902'),('M2','0903');
INSERT INTO FARMER VALUES('F1','Tâm'),('F2','Sơn'),('F3','Vân');
INSERT INTO CROP VALUES('C1','Lúa'),('C2','Ngô'),('C3','Khoai');
INSERT INTO SUPPLY VALUES('F1','C1','M1',12),('F1','C2','M1',8),('F2','C1','M2',15),('F2','C3','M1',6),('F3','C2','M1',9);`,
hidden:`INSERT INTO MARKET_PHONE VALUES('M2','0904'),('M3','0905');
INSERT INTO FARMER VALUES('F4','Lý');
INSERT INTO SUPPLY VALUES('F3','C1','M2',20),('F1','C3','M2',7),('F4','C3','M3',20);`,
parts:[
{t:"Liệt kê các PhoneNumber của chợ M1, sắp tăng dần.",h:"WHERE và ORDER BY.",ord:1,sql:"SELECT PhoneNumber FROM MARKET_PHONE WHERE MarketID='M1' ORDER BY PhoneNumber"},
{t:"Tìm chợ có từ 2 số điện thoại trở lên: MName, SoDT.",h:"Kết MARKET với MARKET_PHONE, HAVING.",sql:"SELECT m.MName, COUNT(*) AS SoDT FROM MARKET m JOIN MARKET_PHONE p ON m.MarketID=p.MarketID GROUP BY m.MarketID, m.MName HAVING COUNT(*)>=2"},
{t:"Với mỗi dòng cung ứng có Price ≥ 10, cho biết FName, CName, MName, Price.",h:"Kết bảng nối 3 ngôi với cả ba thực thể.",sql:"SELECT f.FName, c.CName, m.MName, s.Price FROM SUPPLY s JOIN FARMER f ON s.FarmerID=f.FarmerID JOIN CROP c ON s.CropID=c.CropID JOIN MARKET m ON s.MarketID=m.MarketID WHERE s.Price>=10"},
{t:"Tìm FarmerID của nông dân chưa từng cung ứng cho chợ M2.",h:"NOT IN trên SUPPLY lọc theo M2.",sql:"SELECT FarmerID FROM FARMER WHERE FarmerID NOT IN (SELECT FarmerID FROM SUPPLY WHERE MarketID='M2')"},
{t:"Tìm (các) dòng cung ứng có giá cao nhất: FarmerID, CropID, MarketID, Price. Nếu đồng hạng phải liệt kê tất cả.",h:"So với SELECT MAX(Price).",sql:"SELECT FarmerID, CropID, MarketID, Price FROM SUPPLY WHERE Price=(SELECT MAX(Price) FROM SUPPLY)"},
]},
{title:"Lịch bác sĩ (M–N lặp theo lịch)", story:"Khóa của SCHEDULE gồm cả DayOfWeek và StartTime.",
schema:`CREATE TABLE DOCTOR(DID TEXT PRIMARY KEY, DName TEXT, Specialty TEXT);
CREATE TABLE CLINIC(ClinicID TEXT PRIMARY KEY, CName TEXT);
CREATE TABLE SCHEDULE(DID TEXT REFERENCES DOCTOR(DID), ClinicID TEXT REFERENCES CLINIC(ClinicID), DayOfWeek TEXT, StartTime TEXT, EndTime TEXT, PRIMARY KEY(DID,ClinicID,DayOfWeek,StartTime));`,
seed:`INSERT INTO DOCTOR VALUES('D1','Anh','Noi'),('D2','Bình','Ngoai'),('D3','Cúc','Nhi'),('D4','Duy','Noi');
INSERT INTO CLINIC VALUES('C1','Bình An'),('C2','Tâm Đức'),('C3','Hòa Bình');
INSERT INTO SCHEDULE VALUES('D1','C1','Mon','08:00','11:00'),('D1','C1','Mon','14:00','17:00'),('D1','C2','Tue','08:00','11:00'),('D2','C1','Sun','08:00','11:00'),('D2','C3','Sun','14:00','17:00'),('D3','C2','Wed','08:00','11:00');`,
hidden:`INSERT INTO SCHEDULE VALUES('D3','C1','Thu','08:00','11:00'),('D4','C3','Mon','08:00','11:00'),('D2','C2','Sun','08:00','11:00');
INSERT INTO DOCTOR VALUES('D5','Em','Nhi');`,
parts:[
{t:"Liệt kê DID, ClinicID, StartTime của các ca vào thứ 'Mon'.",h:"Lọc theo DayOfWeek.",sql:"SELECT DID, ClinicID, StartTime FROM SCHEDULE WHERE DayOfWeek='Mon'"},
{t:"Liệt kê các cặp (DName, CName) mà bác sĩ có ca tại phòng khám (không trùng).",h:"DISTINCT vì một cặp có thể có nhiều ca.",sql:"SELECT DISTINCT d.DName, c.CName FROM SCHEDULE s JOIN DOCTOR d ON s.DID=d.DID JOIN CLINIC c ON s.ClinicID=c.ClinicID"},
{t:"Với MỌI bác sĩ, kể cả chưa có ca, cho biết DName, SoCa.",h:"LEFT JOIN và COUNT(cột của SCHEDULE).",sql:"SELECT d.DName, COUNT(s.DID) AS SoCa FROM DOCTOR d LEFT JOIN SCHEDULE s ON d.DID=s.DID GROUP BY d.DID, d.DName"},
{t:"Tìm DID của bác sĩ có ca tại CẢ HAI phòng khám C1 và C2 (không trùng).",h:"INTERSECT hai tập DID.",sql:"SELECT DID FROM SCHEDULE WHERE ClinicID='C1' INTERSECT SELECT DID FROM SCHEDULE WHERE ClinicID='C2'"},
{t:"Tìm CName của các phòng khám không có ca nào vào 'Sun'.",h:"NOT IN trên các ca Sun.",sql:"SELECT CName FROM CLINIC WHERE ClinicID NOT IN (SELECT ClinicID FROM SCHEDULE WHERE DayOfWeek='Sun')"},
]},
{title:"Sách và chương (thực thể yếu)", story:"CHAPTER là thực thể yếu của BOOK; từ khóa của chương được tách thành bảng riêng.",
schema:`CREATE TABLE BOOK(BookID TEXT PRIMARY KEY, BTitle TEXT, PubYear INT);
CREATE TABLE CHAPTER(BookID TEXT REFERENCES BOOK(BookID), ChapNo INT, CTitle TEXT, Pages INT, PRIMARY KEY(BookID,ChapNo));
CREATE TABLE CHAPTER_KEYWORDS(BookID TEXT, ChapNo INT, Keyword TEXT, PRIMARY KEY(BookID,ChapNo,Keyword), FOREIGN KEY(BookID,ChapNo) REFERENCES CHAPTER(BookID,ChapNo));`,
seed:`INSERT INTO BOOK VALUES('B1','Nhập môn CSDL',2020),('B2','Mạng máy tính',2022),('B3','Toán rời rạc',2019);
INSERT INTO CHAPTER VALUES('B1',1,'Mô hình ER',30),('B1',2,'Đại số quan hệ',25),('B1',3,'SQL',40),('B2',1,'Tổng quan',20),('B2',2,'TCP/IP',35);
INSERT INTO CHAPTER_KEYWORDS VALUES('B1',1,'ERD'),('B1',3,'SQL'),('B1',3,'JOIN'),('B2',2,'SQL'),('B2',2,'Protocol');`,
hidden:`INSERT INTO CHAPTER VALUES('B3',1,'Logic',15),('B3',2,'Đồ thị',22);
INSERT INTO CHAPTER_KEYWORDS VALUES('B3',1,'ERD'),('B3',2,'Graph'),('B2',1,'SQL');
INSERT INTO BOOK VALUES('B4','Sách mới',2025);`,
parts:[
{t:"Liệt kê ChapNo, CTitle của sách B1, sắp tăng dần theo ChapNo.",h:"WHERE và ORDER BY.",ord:1,sql:"SELECT ChapNo, CTitle FROM CHAPTER WHERE BookID='B1' ORDER BY ChapNo"},
{t:"Với mỗi sách có chương, cho biết BTitle và TongTrang.",h:"Kết BOOK với CHAPTER, SUM.",sql:"SELECT b.BTitle, SUM(c.Pages) AS TongTrang FROM BOOK b JOIN CHAPTER c ON b.BookID=c.BookID GROUP BY b.BookID, b.BTitle"},
{t:"Lấy BTitle, ChapNo, CTitle của các chương có từ khóa 'SQL'.",h:"Kết theo khóa tổ hợp (BookID, ChapNo).",sql:"SELECT b.BTitle, c.ChapNo, c.CTitle FROM CHAPTER_KEYWORDS k JOIN CHAPTER c ON k.BookID=c.BookID AND k.ChapNo=c.ChapNo JOIN BOOK b ON c.BookID=b.BookID WHERE k.Keyword='SQL'"},
{t:"Lấy BookID, ChapNo của các chương chưa có từ khóa nào.",h:"NOT EXISTS so khớp cả hai cột khóa.",sql:"SELECT BookID, ChapNo FROM CHAPTER c WHERE NOT EXISTS (SELECT 1 FROM CHAPTER_KEYWORDS k WHERE k.BookID=c.BookID AND k.ChapNo=c.ChapNo)"},
{t:"Tìm các từ khóa xuất hiện ở từ 2 sách khác nhau trở lên: Keyword, SoSach.",h:"COUNT(DISTINCT BookID).",sql:"SELECT Keyword, COUNT(DISTINCT BookID) AS SoSach FROM CHAPTER_KEYWORDS GROUP BY Keyword HAVING COUNT(DISTINCT BookID)>=2"},
]},
{title:"Đội và giải đấu (M–N có thuộc tính)", story:"PARTICIPATE(TID, TrID, Result). Result có thể là Champion, RunnerUp hoặc Group.",
schema:`CREATE TABLE TEAM(TID TEXT PRIMARY KEY, TName TEXT, City TEXT);
CREATE TABLE TOURN(TrID TEXT PRIMARY KEY, TrName TEXT, TrYear INT);
CREATE TABLE PARTICIPATE(TID TEXT REFERENCES TEAM(TID), TrID TEXT REFERENCES TOURN(TrID), Result TEXT, PRIMARY KEY(TID,TrID));`,
seed:`INSERT INTO TEAM VALUES('T1','Sao Đỏ','Hà Nội'),('T2','Sông Lam','Vinh'),('T3','Biển Xanh','Đà Nẵng'),('T4','Núi Cao','Lào Cai');
INSERT INTO TOURN VALUES('G1','Cúp Xuân',2025),('G2','Cúp Hè',2025),('G3','Cúp Thu',2024);
INSERT INTO PARTICIPATE VALUES('T1','G1','Champion'),('T1','G2','RunnerUp'),('T2','G1','RunnerUp'),('T2','G3','Champion'),('T3','G2','Champion');`,
hidden:`INSERT INTO TEAM VALUES('T5','Rừng Xanh','Kon Tum');
INSERT INTO TOURN VALUES('G4','Cúp Đông',2025);
INSERT INTO PARTICIPATE VALUES('T1','G4','Group'),('T3','G1','Group'),('T3','G4','RunnerUp'),('T5','G4','Champion');`,
parts:[
{t:"Liệt kê TrName của các giải năm 2025, sắp tăng dần theo TrName.",h:"WHERE và ORDER BY.",ord:1,sql:"SELECT TrName FROM TOURN WHERE TrYear=2025 ORDER BY TrName"},
{t:"Với các kết quả Champion, cho biết TName, TrName.",h:"Kết 3 bảng.",sql:"SELECT t.TName, g.TrName FROM PARTICIPATE p JOIN TEAM t ON p.TID=t.TID JOIN TOURN g ON p.TrID=g.TrID WHERE p.Result='Champion'"},
{t:"Với MỌI đội, kể cả chưa dự giải nào, cho biết TName, SoGiai.",h:"LEFT JOIN và COUNT(cột của PARTICIPATE).",sql:"SELECT t.TName, COUNT(p.TrID) AS SoGiai FROM TEAM t LEFT JOIN PARTICIPATE p ON t.TID=p.TID GROUP BY t.TID, t.TName"},
{t:"Tìm TName của các đội chưa từng vô địch.",h:"NOT IN trên các dòng Champion.",sql:"SELECT TName FROM TEAM WHERE TID NOT IN (SELECT TID FROM PARTICIPATE WHERE Result='Champion')"},
{t:"Tìm TID của đội đã dự TẤT CẢ các giải năm 2025.",h:"Phép chia trên tập giải 2025.",sql:"SELECT t.TID FROM TEAM t WHERE NOT EXISTS (SELECT 1 FROM TOURN g WHERE g.TrYear=2025 AND NOT EXISTS (SELECT 1 FROM PARTICIPATE p WHERE p.TID=t.TID AND p.TrID=g.TrID))"},
]},
{title:"PERSON, STUDENT, EMPLOYEE (ISA giao thoa)", story:"Class-table có giao thoa: một PID có thể xuất hiện ở cả STUDENT và EMPLOYEE.",
schema:`CREATE TABLE PERSON(PID TEXT PRIMARY KEY, Name TEXT);
CREATE TABLE STUDENT(PID TEXT PRIMARY KEY REFERENCES PERSON(PID), Major TEXT);
CREATE TABLE EMPLOYEE(PID TEXT PRIMARY KEY REFERENCES PERSON(PID), Salary INT);`,
seed:`INSERT INTO PERSON VALUES('P1','An'),('P2','Bình'),('P3','Chi'),('P4','Dũng'),('P5','Hà');
INSERT INTO STUDENT VALUES('P1','CS'),('P2','IS'),('P3','CS');
INSERT INTO EMPLOYEE VALUES('P2',10),('P3',20),('P4',15);`,
hidden:`INSERT INTO PERSON VALUES('P6','Khoa'),('P7','Lan');
INSERT INTO STUDENT VALUES('P6','IS');
INSERT INTO EMPLOYEE VALUES('P6',30),('P1',12);`,
parts:[
{t:"Lấy Name, Major của mọi sinh viên, sắp tăng dần theo Name.",h:"Kết PERSON với STUDENT.",ord:1,sql:"SELECT p.Name, s.Major FROM PERSON p JOIN STUDENT s ON p.PID=s.PID ORDER BY p.Name"},
{t:"Lấy Name của những người vừa là sinh viên vừa là nhân viên.",h:"Kết cả ba bảng theo PID.",sql:"SELECT p.Name FROM PERSON p JOIN STUDENT s ON p.PID=s.PID JOIN EMPLOYEE e ON p.PID=e.PID"},
{t:"Lấy Name của sinh viên không phải nhân viên.",h:"NOT IN trên EMPLOYEE.",sql:"SELECT p.Name FROM PERSON p JOIN STUDENT s ON p.PID=s.PID WHERE p.PID NOT IN (SELECT PID FROM EMPLOYEE)"},
{t:"Lấy Name của người không thuộc lớp con nào.",h:"Không có trong STUDENT và EMPLOYEE.",sql:"SELECT Name FROM PERSON WHERE PID NOT IN (SELECT PID FROM STUDENT) AND PID NOT IN (SELECT PID FROM EMPLOYEE)"},
{t:"Với mỗi Major có sinh viên đi làm, cho biết Major, LuongTB của những sinh viên đó.",h:"Kết STUDENT với EMPLOYEE, AVG.",sql:"SELECT s.Major, AVG(e.Salary) AS LuongTB FROM STUDENT s JOIN EMPLOYEE e ON s.PID=e.PID GROUP BY s.Major"},
]},
];
})();
