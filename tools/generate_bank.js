// Sinh lại ngân hàng trắc nghiệm theo các dạng đề đã thu thập. Chạy: node tools/generate_bank.js
// o[0] luôn là đáp án đúng; thứ tự được xáo khi hiển thị.
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const kept = JSON.parse(fs.readFileSync(path.join(__dirname, 'hand_kept.json'), 'utf8'));
let seed = 20261110;
const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const ri = n => Math.floor(rnd() * n), choice = a => a[ri(a.length)];
const lines = s => s.trim().split('\n').map(l => l.trim()).filter(Boolean);
const f2 = s => s.split('|').map(p => p.split(':'));

// ===================== PHẦN 1: ÁNH XẠ ERD =====================
const mapping = [];
const S1 = `DRIVER:DriverID|SHIPMENT:ShipmentID|WAREHOUSE:WarehouseID|DELIVERS|StartDate,VehicleType
PILOT:PilotID|FLIGHT:FlightID|AIRLINE:AirlineID|ASSIGNED|Role,DutyHours
NURSE:NurseID|PATIENT:PatientID|WARD:WardID|CARES|ShiftDate,Note
WORKER:WorkerID|TASK:TaskID|PROJECT:ProjectID|WORKS_ON|Hours,Rate
AUTHOR:AuthorID|BOOK:BookID|PUBLISHER:PubID|WRITES|AuthorOrder,Royalty
ACTOR:ActorID|MOVIE:MovieID|STUDIO:StudioID|ACTS_IN|RoleName,Salary
STUDENT:SID|SECTION:SecID|COURSE:CID|ENROLLS|Grade,Attendance
MECHANIC:MechID|REPAIR:RepairID|GARAGE:GarageID|HANDLES|Hours,Cost
GUIDE:GuideID|TOUR:TourID|AGENCY:AgencyID|LEADS|StartDate,Bonus
CHEF:ChefID|DISH:DishID|RESTAURANT:RestID|COOKS|Station,Rating
TEACHER:TID|CLASS:ClassID|SCHOOL:SchoolID|TEACHES|Subject,Periods
ENGINEER:EngID|MACHINE:MachID|FACTORY:FactID|MAINTAINS|LastDate,Hours
COURIER:CourID|PARCEL:ParcelID|HUB:HubID|CARRIES|PickDate,Fee
ARTIST:ArtistID|ALBUM:AlbumID|LABEL:LabelID|RECORDS|TrackCount,Role
VOLUNTEER:VolID|EVENT:EventID|ORGANIZER:OrgID|JOINS|Hours,Team`;
for (const l of lines(S1)) { const p = f2(l), [A, a] = p[0], [B, b] = p[1], [C, c] = p[2], R = p[3][0], at = p[4][0].replace(',', ', ');
  mapping.push({ q: `Cho lược đồ ERD: ${C} (1) — ${B} (N), mỗi ${B} bắt buộc thuộc một ${C}; ${A} (M) — ${R} — ${B} (N) có các thuộc tính ${at}. Ánh xạ đúng cho ${B} và ${R} là gì?`,
    o: [`${B}(${b} PK, ${c} FK -> ${C} NOT NULL); ${R}(${a} FK -> ${A}, ${b} FK -> ${B}, ${at}, PK(${a}, ${b}))`,
      `${B}(${b} PK, ${c} FK -> ${C}); ${R}(${a} FK -> ${A}, ${b} FK -> ${B}, ${at}, PK(${a}))`,
      `${B}(${b} PK, ${a} FK -> ${A}, ${c} FK -> ${C} NOT NULL, ${at})`,
      `${C}(${c} PK, ${b} FK -> ${B} NOT NULL); ${R}(${a} FK -> ${A}, ${b} FK -> ${B}, ${at}, PK(${a}, ${b}))`],
    e: `1–N bắt buộc: FK NOT NULL đặt ở phía N (${B}). M–N có thuộc tính: bảng nối ${R} với khóa chính gồm hai khóa ngoại.` }); }
const S2 = `MARKET:MarketID:PhoneNumber|FARMER:FarmerID|CROP:CropID|SUPPLY|Price
STORE:StoreID:Hotline|VENDOR:VendorID|ITEM:ItemID|STOCKS|UnitCost
HOSPITAL:HospID:Phone|SUPPLIER:SuppID|DRUG:DrugID|PROVIDES|BatchPrice
CINEMA:CinemaID:Phone|DISTRIBUTOR:DistID|FILM:FilmID|SCREENS|Fee
SCHOOL:SchoolID:Email|TEACHER:TeacherID|SUBJECT:SubjID|ASSIGNS|Periods
GYM:GymID:Phone|TRAINER:TrainerID|PROGRAM:ProgID|OFFERS|Price
PORT:PortID:Contact|CARRIER:CarrierID|CARGO:CargoID|SHIPS|Freight
LIBRARY:LibID:Email|DONOR:DonorID|BOOK:BookID|DONATES|Quantity
FARM:FarmID:Phone|BUYER:BuyerID|PRODUCT:ProdID|SELLS|Amount
THEATER:TheaterID:Hotline|TROUPE:TroupeID|PLAY:PlayID|STAGES|Ticket
AIRPORT:AirportID:Contact|AIRLINE:AirlineID|ROUTE:RouteID|SERVES|Fare
MUSEUM:MuseumID:Email|LENDER:LenderID|ARTWORK:ArtID|DISPLAYS|Insurance
WAREHOUSE:WhID:Phone|SUPPLIER:SuppID|PART:PartID|STORES|Qty
CAFE:CafeID:Phone|ROASTER:RoasterID|BEAN:BeanID|BUYS|Price
HOTEL:HotelID:Hotline|AGENT:AgentID|PACKAGE:PkgID|SELLS_VIA|Commission`;
for (const l of lines(S2)) { const p = f2(l), [M, m, v] = p[0], [A, a] = p[1], [B, b] = p[2], R = p[3][0], x = p[4][0], T = `${M}_${v.toUpperCase()}`;
  const good = `${T}(${m} FK -> ${M}, ${v}, PK(${m}, ${v}))`, sup = `${R}(${a} FK -> ${A}, ${b} FK -> ${B}, ${m} FK -> ${M}, ${x}, PK(${a}, ${b}, ${m}))`;
  mapping.push({ q: `Cho ERD: ${M} có thuộc tính đa trị ${v} (không giả định ${v} là duy nhất giữa các ${M}); liên kết 3 ngôi M:N:P ${R} giữa ${A}, ${B}, ${M} có thuộc tính ${x}. Kết quả ánh xạ đúng là gì?`,
    o: [`${good}; ${sup}`, `${T}(${v} PK, ${m} FK -> ${M}); ${sup}`,
      `${M}(${m} PK, ${v}); ${sup}`,
      `${good}; ${R}(${a} FK -> ${A}, ${b} FK -> ${B}, ${m} FK -> ${M}, ${x}, PK(${a}, ${b}))`],
    e: `Đa trị tách bảng với khóa (${m}, ${v}). Liên kết 3 ngôi: bảng nối có khóa gồm cả ba khóa ngoại.` }); }
const S3 = `BOOK:BookID|CHAPTER:ChapNo:Keywords
COURSE:CID|LESSON:LessonNo:Tags
BUILDING:BldgID|ROOM:RoomNo:Equipment
ORDERS:OrderID|ITEM_LINE:LineNo:Notes
ALBUM:AlbumID|TRACK:TrackNo:Genres
EMPLOYEE:EmpID|DEPENDENT:DepName:Phones
PLAYLIST:ListID|ENTRY:Pos:Labels
INVOICE:InvID|INV_LINE:LineNo:Discounts
SERIES:SeriesID|EPISODE:EpNo:Subtitles
EXAM:ExamID|QUESTION:QNo:Topics
HOTEL:HotelID|SUITE:SuiteNo:Amenities
TRAIN:TrainID|CARRIAGE:CarNo:Facilities
PROJECT:ProjID|PHASE:PhaseNo:Risks
CONTRACT:ContractID|CLAUSE:ClauseNo:Refs
MAGAZINE:MagID|EDITION:EdNo:Themes`;
for (const l of lines(S3)) { const p = f2(l), [O, o] = p[0], [W, w, v] = p[1], T = `${W}_${v.toUpperCase()}`;
  mapping.push({ q: `Cho ERD: ${W} là thực thể yếu phụ thuộc ${O}, khóa bộ phận ${w}; ${W} có thuộc tính đa trị ${v}. Ánh xạ đúng là gì?`,
    o: [`${W}(${o} FK -> ${O}, ${w}, PK(${o}, ${w})); ${T}(${o}, ${w}, ${v}, PK(${o}, ${w}, ${v}), FK(${o}, ${w}) -> ${W})`,
      `${W}(${w} PK, ${o} FK -> ${O}); ${T}(${w} FK -> ${W}, ${v}, PK(${w}, ${v}))`,
      `${W}(${o} FK -> ${O}, ${w}, PK(${o}, ${w})); ${T}(${o}, ${w}, ${v}, PK(${o}, ${w}), FK(${o}, ${w}) -> ${W})`,
      `${W}(${o} FK -> ${O}, ${w}, ${v}, PK(${o}, ${w}))`],
    e: `Thực thể yếu lấy khóa của chủ cộng khóa bộ phận. Bảng đa trị mang đủ khóa của ${W} và giá trị đa trị.` }); }
const S4 = `DOCTOR:DID|CLINIC:ClinicID|SCHEDULE|DayOfWeek,StartTime|EndTime
TEACHER:TID|ROOM:RoomID|TIMETABLE|DayOfWeek,Period|Subject
NURSE:NurseID|WARD:WardID|ROSTER|WorkDate,Shift|Note
GUARD:GuardID|GATE:GateID|DUTY|DutyDate,Shift|Remark
INSTRUCTOR:IID|LAB:LabID|LAB_SESSION|DayOfWeek,StartTime|Topic
TRAINER:TrainerID|GYM:GymID|CLASS_SLOT|DayOfWeek,StartTime|Level
BUS:BusID|ROUTE:RouteID|TRIP|TripDate,DepartTime|DriverName
PILOT:PilotID|AIRCRAFT:PlaneID|SORTIE|FlyDate,TakeOff|Duration
BARISTA:BarID|BRANCH:BranchID|SHIFT_PLAN|WorkDate,StartTime|Hours
CONSULTANT:ConsID|CLIENT:ClientID|MEETING|MeetDate,StartTime|Agenda
DENTIST:DentID|CHAIR:ChairID|BOOKING|DayOfWeek,Slot|Notes
COACH:CoachID|TEAM:TeamID|PRACTICE|PracDate,StartTime|Focus
SPEAKER:SpkID|HALL:HallID|TALK|TalkDate,StartTime|TalkTitle
TECHNICIAN:TechID|SITE:SiteID|VISIT|VisitDate,StartTime|Report
LIFEGUARD:LgID|POOLAREA:PoolID|WATCH|WorkDate,Shift|Note`;
for (const l of lines(S4)) { const p = f2(l), [A, a] = p[0], [B, b] = p[1], R = p[2][0], [d1, d2] = p[3][0].split(','), x = p[4][0];
  mapping.push({ q: `Cho ERD: ${A} (M) — ${R} — ${B} (N) có các thuộc tính ${d1}, ${d2}, ${x}. Một ${A} có thể có nhiều lịch tại cùng một ${B}, phân biệt theo ${d1} và ${d2}. Ánh xạ đúng là gì?`,
    o: [`${R}(${a} FK -> ${A}, ${b} FK -> ${B}, ${d1}, ${d2}, ${x}, PK(${a}, ${b}, ${d1}, ${d2}))`,
      `${R}(${a} FK -> ${A}, ${b} FK -> ${B}, ${d1}, ${d2}, ${x}, PK(${a}, ${b}))`,
      `${R}(${a} FK -> ${A}, ${b} FK -> ${B}, ${d1}, ${d2}, ${x}, PK(${d1}, ${d2}))`,
      `${A}(${a} PK, ${b} FK -> ${B}, ${d1}, ${d2}, ${x})`],
    e: `Cặp (${a}, ${b}) lặp lại theo lịch nên khóa phải gồm cả ${d1} và ${d2}.` }); }
const S5 = `TEAM:TID|TOURN:TrID|PARTICIPATE|Result
STUDENT:SID|COURSE:CID|ENROLL|Grade
EMPLOYEE:EID|PROJECT:PID|ASSIGN|Hours
PRODUCT:ProdID|ORDERS:OrderID|ORDER_LINE|Quantity
AUTHOR:AID|PAPER:PaperID|WRITES|Position
ACTOR:ActID|FILM:FilmID|CASTS|Role
DOCTOR:DID|HOSPITAL:HID|WORKS_AT|Contract
SUPPLIER:SID|PART:PartID|SUPPLIES|Price
MEMBER:MID|CLUB:ClubID|JOINS|JoinDate
SINGER:SgID|SONG:SongID|PERFORMS|PerformOrder
TOURIST:TouristID|CITY:CityID|VISITS|Rating
USERS:UID|GROUPS:GID|BELONGS|Role
INGREDIENT:IngID|RECIPE:RecID|USED_IN|Amount
SKILL:SkillID|WORKER:WID|HAS_SKILL|Level
SPONSOR:SpID|EVENT:EvID|FUNDS|Amount`;
for (const l of lines(S5)) { const p = f2(l), [A, a] = p[0], [B, b] = p[1], R = p[2][0], x = p[3][0];
  mapping.push({ q: `Quan hệ nào dưới đây thể hiện lược đồ trên?`, d: { a: A, ac: 'M', r: R, b: B, bc: 'N', attrs: [x] },
    o: [`${A}(${a} PK); ${B}(${b} PK); ${R}(${a} FK, ${b} FK, ${x}, PK(${a},${b}))`, `${A}(${a} PK); ${B}(${b} PK); ${R}(${a} FK, ${b} FK, ${x}, PK(${a}))`, `${A}(${a} PK); ${B}(${b} PK, ${a} FK, ${x})`, `${R}(${a} PK, ${b} PK, ${x}) (không FK)`],
    e: `M–N có thuộc tính: tạo bảng nối ${R}, khóa chính là cặp hai khóa ngoại.` }); }
const S6 = `PRODUCT:PID|Tag
EMPLOYEE:EID|Phone
STUDENT:SID|Email
CUSTOMER:CustID|Address
MOVIE:MID|Genre
AUTHOR:AID|PenName
DOCTOR:DID|Specialty
RESTAURANT:RestID|Cuisine
HOTEL:HID|Amenity
COURSE:CID|Textbook
ARTICLE:ArtID|Keyword
SUPPLIER:SuppID|Contact
VEHICLE:VID|Color
PLAYER:PlayerID|Position
COMPANY:CoID|Website`;
for (const l of lines(S6)) { const p = f2(l), [E, e] = p[0], v = p[1][0], T = `${E}_${v.toUpperCase()}`;
  mapping.push({ q: `ERD: ${E}{${e}, ${v}*} với ${v} là thuộc tính đa trị. Không giả định ${v} là duy nhất giữa các ${E}. Chọn lược đồ đúng.`,
    o: [`${E}(${e} PK); ${T}(${e} FK, ${v}, PK(${e}, ${v}))`, `${E}(${e} PK, ${v})`, `${E}(${e} PK); ${T}(${v} PK, ${e} FK)`, `${E}(${e} PK); ${T}(${e} PK, ${v})`],
    e: `Đa trị tách bảng riêng, khóa chính gồm khóa thực thể gốc và giá trị đa trị.` }); }
const S7 = `Vehicle:VID:Make|Car:Seats|Truck:Capacity
Employee:EID:Name|Engineer:Major|Secretary:TypingSpeed
Account:AccNo:Balance|Saving:InterestRate|Checking:Overdraft
Person:PID:Name|Lecturer:Degree|Staff:Position
Product:ProdID:Price|Book:Pages|Laptop:RamGB
Payment:PayID:Amount|Card:CardNo|Cash:Cashier
Media:MediaID:Title|Video:Duration|Audio:Bitrate
Ticket:TicketID:Price|FlightTicket:Seat|TrainTicket:Carriage
Property:PropID:Address|House:Floors|Land:AreaM2
Animal:AnimalID:Name|Bird:WingSpan|Fish:WaterType
Course:CID:Title|Online:Platform|Offline:Room
Device:DevID:Brand|Phone:ScreenSize|Tablet:StylusType
Insurance:InsID:Premium|Health:Hospital|Auto:PlateNo
Contract:ConID:Value|Fulltime:Salary|Parttime:HourRate
Member:MemID:JoinDate|Gold:Points|Silver:Discount`;
for (const l of lines(S7)) { const p = f2(l), [P, k, c] = p[0], [X, x] = p[1], [Y, y] = p[2], up = s => s.toUpperCase();
  mapping.push({ q: `ERD: ISA (chuyên biệt hóa): ${P}{${k}, ${c}} với ${X}{${x}} và ${Y}{${y}}. Dạng ánh xạ ‘class-table’. Chọn lược đồ đúng.`,
    o: [`${up(P)}(${k} PK, ${c}); ${up(X)}(${k} PK/FK -> ${up(P)}, ${x}); ${up(Y)}(${k} PK/FK -> ${up(P)}, ${y})`,
      `${up(P)}(${k} PK, ${c}, ${x}, ${y})`,
      `${up(X)}(${k} PK, ${c}, ${x}); ${up(Y)}(${k} PK, ${c}, ${y})`,
      `${up(P)}(${k} PK, ${c}); ${up(X)}(${x} PK, ${k} FK -> ${up(P)}); ${up(Y)}(${y} PK, ${k} FK -> ${up(P)})`],
    e: `Class-table: bảng cha giữ khóa và thuộc tính chung; mỗi bảng con dùng khóa cha làm PK/FK.` }); }
const S8 = `PERSON:PID:Name|STUDENT:Major|EMPLOYEE:Salary
USERS:UID:Name|BUYER:ShipAddr|SELLER:ShopName
STAFF:StaffID:Name|TEACHER:Subject|RESEARCHER:Field
PARTY:PartyID:Name|CUSTOMER:Tier|SUPPLIER:Terms
ARTIST:ArtistID:Name|SINGER:VocalRange|COMPOSER:Style
ATHLETE:AthID:Name|RUNNER:BestTime|SWIMMER:Stroke
MEMBER:MemID:Name|COACH:License|PLAYER:Position
DOCTOR:DocID:Name|SURGEON:Theatre|LECTURER:Faculty
EMPLOYEE:EID:Name|MANAGER:Bonus|ENGINEER:Major
CREATOR:CrID:Name|WRITER:Genre|DIRECTOR:Awards
PROFESSIONAL:ProID:Name|LAWYER:BarNo|ACCOUNTANT:CpaNo
VOLUNTEER:VolID:Name|DRIVER:LicenseNo|MEDIC:CertNo
RESIDENT:ResID:Name|OWNER:Deed|RENTER:LeaseNo
PERFORMER:PerfID:Name|DANCER:DanceStyle|ACTOR:Agency
ACCOUNT:AccID:Email|ADMIN:AdminLevel|AUTHOR:Bio`;
for (const l of lines(S8)) { const p = f2(l), [P, k, c] = p[0], [X, x] = p[1], [Y, y] = p[2];
  mapping.push({ q: `Mapping quan hệ ISA (có giao thoa): ${P} có ${X}{${x}} và ${Y}{${y}}; một ${P} có thể đồng thời là cả hai. Thiết kế nào sau đây hỗ trợ giao thoa tốt?`,
    o: [`${P}(${k} PK, ${c}); ${X}(${k} PK/FK -> ${P}, ${x}); ${Y}(${k} PK/FK -> ${P}, ${y})`,
      `${X}(${k} PK, ${c}, ${x}); ${Y}(${k} PK, ${c}, ${y}) (không có bảng ${P})`,
      `${P}(${k} PK, ${c}); ${X}(${k} PK/FK -> ${P}); ${Y}(${k} PK/FK -> ${P})`,
      `${P}(${k} PK, ${c}, Type, ${x}, ${y}) với Type chỉ nhận một giá trị`],
    e: `Một ${k} có thể xuất hiện ở cả hai bảng con mà không lặp thuộc tính chung; cột Type đơn trị không biểu diễn được giao thoa.` }); }
const S9 = `EMP:EmpID|DEPT:DeptID
STUDENT:SID|CLASS:ClassID
ORDERS:OrderID|CUSTOMER:CustID
BOOK:BookID|PUBLISHER:PubID
CITY:CityID|COUNTRY:CountryID
PATIENT:PatID|WARD:WardID
FLIGHT:FlightID|AIRLINE:AirID
ROOM:RoomID|HOTEL:HotelID
CAR:CarID|BRAND:BrandID
SONG:SongID|ALBUM:AlbumID
PLAYER:PlayerID|TEAM:TeamID
LESSON:LessonID|COURSE:CID
INVOICE:InvID|CLIENT:ClientID
BRANCH:BranchID|BANK:BankID
MOVIE:MovieID|STUDIO:StudioID`;
for (const l of lines(S9)) { const p = f2(l), [E, e] = p[0], [D, d] = p[1];
  mapping.push({ q: `Nếu mọi ${E} bắt buộc thuộc một ${D} (tham gia toàn phần), thiết kế quan hệ đúng cần gì?`, d: { a: D, ac: '1', r: 'BelongsTo', b: E, bc: 'N' },
    o: [`${d} trong ${E} phải NOT NULL và là FK -> ${D}`, `${d} trong ${E} là FK -> ${D} và được phép NULL`, `Tạo bảng phụ ${E}_${D}(${e}, ${d}, PK(${e}, ${d}))`, `${e} trong ${D} phải NOT NULL và là FK -> ${E}`],
    e: `FK đặt ở phía N; tính bắt buộc được thể hiện bằng NOT NULL.` }); }
const S10 = `Doctor:DoctorID|Patient:PatientID|Medication:MedID|prescribes|PRESCRIPTION|Dose
Teacher:TeacherID|Student:SID|Subject:SubjID|tutors|TUTORING|Fee
Supplier:SuppID|Part:PartID|Project:ProjID|supplies|SUPPLY_LOG|Quantity
Agent:AgentID|Client:ClientID|Policy:PolicyID|sells|SALE|Premium
Mechanic:MechID|Car:CarID|Service:ServID|performs|SERVICE_LOG|Cost
Trainer:TrainerID|Member:MemID|Exercise:ExID|assigns|PLAN_LOG|Reps
Vet:VetID|Pet:PetID|Vaccine:VacID|injects|VACCINATION|Dose
Lawyer:LawID|Client:CliID|Lawsuit:CaseID|represents|REPRESENT|Fee
Judge:JudgeID|Contest:ContestID|Team:TeamID|scores|SCORING|Point
Driver:DriverID|Vehicle:VehID|Route:RouteID|drives|TRIP_LOG|Km
Nurse:NurseID|Patient:PatID|Treatment:TreatID|gives|CARE_LOG|Note
Seller:SellerID|Buyer:BuyerID|Item:ItemID|sells|DEAL|Price
Coach:CoachID|Player:PlayerID|Skill:SkillID|trains|TRAINING|Hours
Author:AuthID|Editor:EdID|Book:BookID|reviews|REVIEW_LOG|Remark
Bank:BankID|Customer:CustID|Loan:LoanID|grants|GRANT_LOG|Amount`;
for (const l of lines(S10)) { const p = f2(l), [A, a] = p[0], [B, b] = p[1], [C, c] = p[2], v = p[3][0], T = p[4][0], x = p[5][0], u = s => s.toUpperCase();
  mapping.push({ q: `ERD: Ternary: ${A} — ${v} — ${B} — ${C}. Quan hệ ba ngôi có thuộc tính ${x}, Date và cùng một bộ ba có thể lặp lại ở nhiều ngày. Chọn ánh xạ đúng.`,
    o: [`${T}(${a} FK, ${b} FK, ${c} FK, ${x}, Date, PK(${a},${b},${c},Date))`,
      `${u(A)}(${a} PK); ${u(B)}(${b} PK); ${u(C)}(${c} PK, ${x}, Date)`,
      `${T}(${a}, ${b}, PK(${a},${b})); ${u(C)}(${c} PK)`,
      `${u(A)}_${u(B)}(${a} FK, ${b} FK, PK(${a},${b})); ${T}(${c} FK, ${x}, Date)`],
    e: `Bảng nối chứa cả ba khóa ngoại; bộ ba lặp theo ngày nên Date phải thuộc khóa chính.` }); }

// ===================== PHẦN 2: THIẾT KẾ =====================
const design = [...kept.design];
const POOL = `Giảng viên|Môn học|học kỳ|MaGV|MaMH|MaHK|dạy|LOP_HOC_PHAN
Bác sĩ|Bệnh nhân|ngày khám|MaBS|MaBN|NgayKham|khám|LAN_KHAM
Độc giả|Sách|ngày mượn|MaDG|MaSach|NgayMuon|mượn|PHIEU_MUON
Khách hàng|Xe|ngày thuê|MaKH|MaXe|NgayThue|thuê|HOP_DONG_THUE
Sinh viên|Môn học|học kỳ|MaSV|MaMH|MaHK|học|DANG_KY_HOC
Nhân viên|Dự án|đợt tham gia|MaNV|MaDA|MaDot|tham gia|DOT_THAM_GIA
Kỹ thuật viên|Thiết bị|ngày bảo trì|MaKTV|MaTB|NgayBT|bảo trì|PHIEU_BAO_TRI
Khách|Phòng|ngày nhận phòng|MaKhach|MaPhong|NgayNhan|thuê|LUOT_LUU_TRU
Cầu thủ|Câu lạc bộ|mùa giải|MaCT|MaCLB|MaMua|thi đấu cho|HOP_DONG_THI_DAU
Đội|Giải đấu|mùa giải|MaDoi|MaGiai|MaMua|tham dự|LAN_THAM_DU
Nghệ sĩ|Sân khấu|đêm diễn|MaNS|MaSK|NgayDien|biểu diễn tại|DEM_DIEN
Tài xế|Tuyến xe|ngày chạy|MaTX|MaTuyen|NgayChay|chạy|CHUYEN_XE
Phi công|Máy bay|ngày bay|MaPC|MaMB|NgayBay|lái|CHUYEN_BAY
Hội viên|Lớp tập|tháng|MaHV|MaLop|Thang|đăng ký|DANG_KY_THANG
Y tá|Khoa|ca trực|MaYT|MaKhoa|MaCa|trực tại|CA_TRUC
Người thuê|Căn hộ|năm|MaNT|MaCH|Nam|thuê|HOP_DONG_NAM
Nhà cung cấp|Sản phẩm|đợt giao|MaNCC|MaSP|MaDot|cung cấp|DOT_CUNG_CAP
Khách du lịch|Tour|đợt khởi hành|MaKDL|MaTour|MaDot|tham gia|DOT_KHOI_HANH
Giáo viên|Lớp|năm học|MaGV|MaLop|NamHoc|chủ nhiệm|NAM_CHU_NHIEM`;
for (const l of lines(POOL)) { const [A, B, T, a, b, t, v, E] = l.split('|');
  design.push({ q: `Kịch bản: Mỗi ${A.toLowerCase()} có thể ${v} nhiều ${B.toLowerCase()}, mỗi ${B.toLowerCase()} có nhiều ${A.toLowerCase()}. Một ${A.toLowerCase()} ${v} một ${B.toLowerCase()} nhiều lần theo ${T}. Thiết kế ERD nào sau đây phù hợp nhất?`,
    o: [`ERD có 3 tập thực thể (${A}, ${B}, ${E}) và 2 liên kết 1–N`, `ERD có 2 tập thực thể (${A}, ${B}) và 1 liên kết M–N không có thuộc tính`, `ERD có 2 tập thực thể (${A}, ${B}) và 1 liên kết 1–N`, `ERD có 1 tập thực thể gộp ${A} và ${B}, thêm cột ghi ${T}`],
    e: `M–N thường có khóa chỉ gồm hai mã nên không lưu được lần lặp; chuyển thành thực thể trung gian ${E} với hai liên kết 1–N.` });
  design.push({ q: `Bảng ${E}(${a} FK, ${b} FK, ${t}) cần lưu mọi lần ${v} lặp lại theo ${T}. Khóa chính phù hợp là:`,
    o: [`PK(${a}, ${b}, ${t})`, `PK(${a}, ${b})`, `PK(${a}, ${t}), bỏ ${b} khỏi bảng`, `PK(${b}, ${t}), bỏ ${a} khỏi bảng`],
    e: `Cặp (${a}, ${b}) lặp lại nên phải thêm ${t} vào khóa.` }); }
design.push(
{q:"Chọn phát biểu đúng về khóa ngoại (FK): nếu bảng CHILD chứa FK trỏ đến bảng PARENT, điều nào sau đây đúng?",o:["FK trong CHILD phải tham chiếu tới PRIMARY KEY hoặc UNIQUE của PARENT","FK trong CHILD bắt buộc phải là khóa chính của CHILD","FK trong CHILD không bao giờ được chứa giá trị trùng nhau","FK trong CHILD không bao giờ được chứa NULL"],e:"FK không cần là PK của CHILD, có thể trùng, và có thể NULL nếu không có ràng buộc NOT NULL."},
{q:"ENROLL có khóa chính PK(SID, CID). Điều này có nghĩa là:",o:["Mỗi cặp (SID, CID) là duy nhất, nhưng SID hoặc CID riêng lẻ có thể lặp","SID là duy nhất trong ENROLL","CID là duy nhất trong ENROLL","SID và CID đều là duy nhất khi xét riêng từng cột"],e:"Khóa tổ hợp ràng buộc tính duy nhất trên cả cặp."},
{q:"Với ENROLL có PK(SID, CID), yêu cầu lưu nhiều lần học lại cùng một môn ở nhiều Semester. Cần sửa khóa thành:",o:["PK(SID, CID, Semester)","PK(SID, Semester)","PK(CID, Semester)","PK(SID)"],e:"Cùng cặp (SID, CID) lặp theo học kỳ."},
{q:"Bảng CHILD(ChildID PK, ParentID FK -> PARENT) không khai báo NOT NULL trên ParentID. Khẳng định đúng là:",o:["Một dòng CHILD có thể không tham chiếu PARENT nào (ParentID là NULL)","Mỗi dòng CHILD bắt buộc phải có một PARENT","ParentID phải là duy nhất trong CHILD","Không được thêm dòng nào vào CHILD trước khi bỏ FK"],e:"FK cho phép NULL nếu không có NOT NULL; NULL không bị kiểm tra tham chiếu."},
{q:"Nếu mọi nhân viên EMP bắt buộc thuộc một DEPT và mỗi DEPT có nhiều EMP, cột nào cần ràng buộc?",o:["EMP.DeptID: NOT NULL và là FK -> DEPT","DEPT.EmpID: NOT NULL và là FK -> EMP","EMP.EmpID: FK -> DEPT","DEPT.DeptID: FK -> EMP và cho phép NULL"],e:"FK nằm ở phía N và NOT NULL thể hiện tham gia toàn phần."},
{q:"Thêm một dòng ENROLL có SID không tồn tại trong STUDENT, với FK ENROLL.SID -> STUDENT.SID. Kết quả là:",o:["Bị từ chối do vi phạm toàn vẹn tham chiếu","Được thêm và SID tự động tạo trong STUDENT","Được thêm với SID đổi thành NULL","Được thêm nếu CID hợp lệ"],e:"FK chỉ chấp nhận giá trị có trong bảng được tham chiếu (hoặc NULL nếu được phép)."},
{q:"FK ENROLL.CID -> COURSE.CID khai báo ON DELETE RESTRICT. Xóa một COURSE đang có ENROLL sẽ:",o:["Bị từ chối","Xóa luôn các ENROLL liên quan","Đặt ENROLL.CID thành NULL","Xóa COURSE và giữ nguyên ENROLL"],e:"RESTRICT chặn xóa khi còn dòng tham chiếu."},
{q:"FK trong bảng nối ENROLL(SID, CID, PK(SID,CID)) có thể dùng ON DELETE SET NULL không?",o:["Không, vì SID và CID thuộc khóa chính nên không được NULL","Có, luôn dùng được với mọi khóa ngoại","Có, nếu bảng nối không có thuộc tính khác","Chỉ dùng được với cột CID"],e:"Cột thuộc khóa chính không nhận NULL."},
{q:"Kịch bản: Mỗi đơn hàng thuộc một khách; khách có nhiều đơn. Mỗi đơn gồm nhiều sản phẩm, có số lượng riêng. Lược đồ phù hợp nhất là:",o:["ORDERS có FK CustID; ORDER_LINE(OrderID FK, ProdID FK, Quantity, PK(OrderID,ProdID))","CUSTOMER có FK OrderID; ORDERS có FK ProdID và Quantity","ORDERS có FK ProdID, Quantity và PK(OrderID)","ORDER_LINE(OrderID PK, ProdID, Quantity); CUSTOMER có FK OrderID"],e:"Khách–đơn là 1–N; đơn–sản phẩm là M–N có thuộc tính."},
{q:"Kịch bản: Sinh viên tham gia nhiều CLB, CLB có nhiều sinh viên; cần lưu ngày gia nhập. Lược đồ đúng là:",o:["MEMBER(SID FK, ClubID FK, JoinDate, PK(SID,ClubID))","STUDENT(SID PK, ClubID FK, JoinDate)","CLUB(ClubID PK, SID FK, JoinDate)","MEMBER(SID PK, ClubID, JoinDate)"],e:"M–N có thuộc tính dùng bảng nối."},
{q:"Kịch bản: Môn học có nhiều môn tiên quyết, một môn có thể là tiên quyết của nhiều môn. Lược đồ đúng là:",o:["PREREQ(CID FK -> COURSE, PreCID FK -> COURSE, PK(CID,PreCID))","COURSE(CID PK, PreCID FK -> COURSE)","PREREQ(CID PK, PreCID FK -> COURSE)","PREREQ(PreCID PK, CID FK -> COURSE)"],e:"Liên kết đệ quy M–N cần bảng nối, cả hai FK trỏ COURSE."},
{q:"Kịch bản: Mỗi giảng viên cố vấn nhiều sinh viên, mỗi sinh viên có đúng một giảng viên cố vấn. Lược đồ tối giản đúng là:",o:["STUDENT(SID PK, AdvisorID FK -> INSTRUCTOR NOT NULL)","INSTRUCTOR(IID PK, SID FK -> STUDENT NOT NULL)","ADVISE(IID PK, SID)","STUDENT(SID PK, AdvisorID PK)"],e:"Liên kết 1–N bắt buộc, FK NOT NULL ở phía N."},
{q:"Kịch bản: Mỗi môn mở nhiều lớp trong nhiều học kỳ; mỗi lớp có một giảng viên và một phòng. Thực thể trung gian phù hợp là:",o:["SECTION(SecID PK, CID FK, Semester, IID FK, Room FK)","COURSE(CID PK, Semester, IID FK, Room FK)","INSTRUCTOR(IID PK, CID FK, Semester, Room FK)","ROOM(Room PK, CID FK, IID FK)"],e:"Mỗi lần mở lớp là một thực thể riêng tham chiếu môn, giảng viên, phòng."},
{q:"Bảng TEACH(IID, CID, Semester, Room). Yêu cầu: một phòng không xếp hai lớp trong cùng Semester (mỗi kỳ một lớp). Ràng buộc phù hợp là:",o:["UNIQUE(Room, Semester)","UNIQUE(IID, Room)","UNIQUE(CID)","CHECK(Room IS NULL)"],e:"Cặp phòng–học kỳ phải duy nhất."},
{q:"ISA có giao thoa: PERSON với STUDENT, EMPLOYEE. Một người vừa là sinh viên vừa là nhân viên được lưu thành:",o:["1 dòng ở PERSON, 1 dòng ở STUDENT và 1 dòng ở EMPLOYEE, cùng PID","2 dòng ở PERSON với hai PID khác nhau","1 dòng ở STUDENT, không có dòng ở PERSON","1 dòng ở EMPLOYEE, không có dòng ở STUDENT"],e:"Cùng một PID xuất hiện ở cả hai bảng con."},
{q:"Thực thể yếu CHAPTER phụ thuộc BOOK. Vì sao khóa của CHAPTER phải chứa BookID?",o:["Vì ChapNo chỉ duy nhất trong phạm vi một BOOK","Vì BookID là thuộc tính đa trị","Vì CHAPTER không được có khóa ngoại","Vì ChapNo luôn duy nhất trên toàn CSDL"],e:"Khóa bộ phận cần khóa của thực thể chủ để định danh đầy đủ."},
{q:"Cột GPA của STUDENT phải nằm trong đoạn 0 đến 4. Ràng buộc phù hợp là:",o:["CHECK (GPA BETWEEN 0 AND 4)","UNIQUE (GPA)","DEFAULT 4","FOREIGN KEY (GPA) REFERENCES COURSE"],e:"CHECK áp đặt điều kiện miền trị."},
{q:"Cột Grade của ENROLL chưa có khi sinh viên đang học. Nên thiết kế Grade là:",o:["Cho phép NULL; NULL biểu thị chưa có điểm","NOT NULL với điểm mặc định 'F'","Thuộc khóa chính của ENROLL","Khóa ngoại trỏ tới COURSE"],e:"NULL biểu thị chưa có giá trị; điểm giả làm sai truy vấn."},
{q:"Muốn mỗi Title của COURSE không trùng nhau nhưng khóa chính vẫn là CID. Khai báo đúng là:",o:["Title UNIQUE NOT NULL","Title PRIMARY KEY, thêm vào cạnh CID PRIMARY KEY","Title FOREIGN KEY -> COURSE","Title DEFAULT ''"],e:"Khóa ứng viên còn lại dùng UNIQUE; một bảng chỉ có một khóa chính."},
{q:"Kịch bản: Mỗi kho có nhiều lô hàng, mỗi lô thuộc đúng một kho; tài xế giao nhiều lô, mỗi lô do nhiều tài xế giao. Số bảng tối thiểu là:",o:["4","3","5","2"],e:"WAREHOUSE, SHIPMENT, DRIVER và bảng nối DELIVERS."},
);

// ===================== PHẦN 3: PHỤ THUỘC HÀM =====================
const toStr = F => F.map(([l, r]) => l + '→' + r).join(', ');
const toV = F => F.map(([l, r]) => l + '>' + r).join(',');
const closure = (x, F) => { const c = new Set(x); let ch = true; while (ch) { ch = false; for (const [l, r] of F) if ([...l].every(a => c.has(a)) && [...r].some(a => !c.has(a))) { [...r].forEach(a => c.add(a)); ch = true; } } return c; };
const imp = (F, l, r) => { const c = closure(l, F); return [...r].every(a => c.has(a)); };
const subs = a => { const o = []; for (let m = 1; m < 1 << a.length; m++) o.push(a.filter((_, i) => m >> i & 1).join('')); return o.sort((p, q) => p.length - q.length || (p < q ? -1 : 1)); };
const keysOf = (r, F) => { const ks = []; for (const s of subs([...r])) { if (ks.some(k => [...k].every(a => s.includes(a)))) continue; if (closure(s, F).size === r.length) ks.push(s); } return ks; };
const pretty = ks => ks.length === 1 ? ks[0] : ks.slice(0, -1).join(', ') + ' và ' + ks[ks.length - 1];
const set = s => '{' + [...s].sort().join(',') + '}';
function randF(n) { const R = 'ABCDEFG'.slice(0, n), m = 3 + ri(3), F = [], seen = new Set();
  while (F.length < m) { const a = [...R].sort(() => rnd() - .5), l = a.slice(0, 1 + ri(2)).sort().join(''), r = a.find(x => !l.includes(x)); const k = l + '>' + r; if (!seen.has(k)) { seen.add(k); F.push([l, r]); } }
  return { R, F: F.sort(() => rnd() - .5) }; }
const usedF = new Set(), freshF = n => { for (;;) { const g = randF(n), k = toV(g.F); if (!usedF.has(k)) { usedF.add(k); return g; } } };
const fd = [...kept.fd];
function closureQ() { for (;;) { const { R, F } = freshF(5 + ri(2)); const x = choice(subs([...R]).filter(s => s.length <= 2)); const c = closure(x, F); if (c.size === x.length || c.size < x.length + 2) continue;
    const others = [...c].filter(a => !x.includes(a)), opts = new Set([set(c)]), outside = [...R].filter(a => !c.has(a));
    let guard = 0; while (opts.size < 4 && guard++ < 60) { let s = new Set(c); const d = 1 + ri(Math.min(2, others.length)); [...others].sort(() => rnd() - .5).slice(0, d).forEach(a => s.delete(a)); if (outside.length && rnd() < .4) s.add(choice(outside)); if (rnd() < .2) s = new Set([...s, ...others.slice(0, 1)]); opts.add(set(s)); }
    if (opts.size < 4) { if (outside.length) { opts.add(set(new Set([...R]))); } opts.add(set(x)); }
    if (opts.size < 4) continue;
    const label = x + '⁺'; return { q: rnd() < .5 ? `F={${toStr(F)}}. ${label} là?` : `Cho R(${[...R].join(',')}), F={${toStr(F)}}. Tìm bao đóng (${x})⁺.`, v: { f: toV(F), x }, o: [...opts].slice(0, 4), e: `Bắt đầu từ ${x}, áp dụng lặp các phụ thuộc có vế trái đã nằm trong tập: ${x}⁺ = ${set(c)}.` }; } }
function fdCandidates(R, F) { const yes = [], no = []; for (const l of subs([...R]).filter(s => s.length <= 2)) for (const r of R) { if (l.includes(r)) continue; if (F.some(([a, b]) => a === l && b === r)) continue; (imp(F, l, r) ? yes : no).push(l + '→' + r); } return { yes, no }; }
function notImpQ() { for (;;) { const { R, F } = freshF(5 + ri(2)); const { yes, no } = fdCandidates(R, F); const trap = no.filter(x => { const [l, r] = x.split('→'); return l.length === 1 && F.some(([a]) => a.includes(l) && a.length > 1) && closure(F.find(([a]) => a.includes(l) && a.length > 1)[0], F).has(r); }); if (yes.length < 3 || !trap.length) continue;
    const w = choice(trap), ys = [...yes].sort(() => rnd() - .5).slice(0, 3), [wl, wr] = w.split('→');
    return { q: `Cho tập phụ thuộc hàm F={${toStr(F)}}. Mệnh đề nào không suy ra từ F?`, v: { f: toV(F), nimp: 1 }, o: [w, ...ys], e: `${wl}⁺ = ${set(closure(wl, F))} không chứa ${wr}. Các phụ thuộc còn lại đều có vế phải nằm trong bao đóng vế trái.` }; } }
function impQ() { for (;;) { const { R, F } = freshF(5 + ri(2)); const { yes, no } = fdCandidates(R, F); if (!yes.length || no.length < 3) continue; const y = choice(yes), [l, r] = y.split('→');
    return { q: `Với F={${toStr(F)}}. Phụ thuộc nào được suy ra từ F?`, v: { f: toV(F), imp: 1 }, o: [y, ...[...no].sort(() => rnd() - .5).slice(0, 3)], e: `${l}⁺ = ${set(closure(l, F))} chứa ${r}.` }; } }
const EQ_OPTS = ['F1 ≡ F2', 'F1 ⇒ F2 but F2 ⇏ F1', 'F2 ⇒ F1 but F1 ⇏ F2', 'Neither implies the other'];
function eqQ(kind) { for (;;) { const { R, F } = freshF(4 + ri(2)); let F2;
    if (kind === '=') { const m = F.find(([a, b]) => F.some(([c, d]) => a === b)); F2 = F.slice(); const a = F[0], b = F.find(([l, r]) => l === a[1]); if (b) F2.push([a[0], b[1]]); else { F2 = F.slice(1); F2.push(a); F2 = F2.map(([l, r]) => [l, r]); const extra = [F[0][0], [...closure(F[0][0], F)].filter(x => !F[0][0].includes(x) && x !== F[0][1])[0]]; if (!extra[1]) continue; F2.push(extra); } }
    else if (kind === '>') { F2 = F.slice(0, -1); if (imp(F2, ...F[F.length - 1])) continue; }
    else { F2 = F.slice(); const i = ri(F.length), [l, r] = F[i]; const o = [...R].filter(x => x !== l[0] && x !== r && !l.includes(x)); if (!o.length) continue; const nf = [o[0], r]; F2[i] = nf; if (imp(F, ...nf) || imp(F2, ...F[i])) continue; }
    const ab = F2.every(([l, r]) => imp(F, l, r)), ba = F.every(([l, r]) => imp(F2, l, r)), c = ab && ba ? '=' : ab ? '>' : ba ? '<' : 'x'; if (c !== kind) continue;
    const sw = rnd() < .0; const ans = { '=': 0, '>': 1, '<': 2, x: 3 }[c], ord = [ans, ...[0, 1, 2, 3].filter(i => i !== ans)];
    return { q: `Let R(${[...R].join(',')}). F1 = {${toStr(F)}} and F2 = {${toStr(F2)}}. Which statement is correct? (Khẳng định đúng là:)`, v: { f1: toV(F), f2: toV(F2), eq: c }, o: ord.map(i => EQ_OPTS[i]), e: 'Tính bao đóng vế trái của từng phụ thuộc trong tập này theo tập kia để kiểm tra hai chiều suy dẫn.' }; } }
function keyQ() { for (;;) { const { R, F } = freshF(4 + ri(3)); const ks = keysOf(R, F); if (ks.length > 4 || ks.every(k => k.length === R.length)) continue;
    const key = pretty(ks), tok = s => [...s.matchAll(/[A-Z]+/g)].map(m => m[0]).sort().join(), used = new Set([tok(key)]), opts = [key], nonk = subs([...R]).filter(s => s.length <= 3 && !ks.includes(s));
    let g = 0; while (opts.length < 4 && g++ < 300) { const n = 1 + ri(Math.min(3, ks.length + 1)), pick = [...nonk].sort(() => rnd() - .5).slice(0, n); if (ks.length > 1 && rnd() < .4) pick[0] = choice(ks); const u = [...new Set(pick)].sort(), o = pretty(u); if (!used.has(tok(o))) { used.add(tok(o)); opts.push(o); } } if (opts.length < 4) continue;
    return { q: `R(${[...R].join(',')}), F={${toStr(F)}}. Tập khóa ứng viên là:`, v: { f: toV(F), r: R, keys: 1 }, o: opts, e: `Thuộc tính chỉ ở vế trái (hoặc không xuất hiện) phải có trong mọi khóa; tính bao đóng từ đó để được các khóa: ${key}.` }; } }
for (let i = 0; i < 28; i++) fd.push(closureQ());
for (let i = 0; i < 24; i++) fd.push(notImpQ());
for (let i = 0; i < 10; i++) fd.push(impQ());
['=', '>', 'x', '=', '>', 'x', '=', '>', 'x', '=', '>', 'x'].forEach(k => fd.push(eqQ(k)));
for (let i = 0; i < 18; i++) fd.push(keyQ());

// ===================== PHẦN 4: ĐẠI SỐ QUAN HỆ =====================
const R = n => ({ t: 'r', n }), J = (...a) => a.reduce((x, y) => ({ t: 'j', a: x, b: y })), Sel = (c, e) => ({ t: 's', c, e }), Pr = (p, e) => ({ t: 'p', p, e }), Un = (a, b) => ({ t: 'u', a, b }), In = (a, b) => ({ t: 'i', a, b }), Mi = (a, b) => ({ t: 'm', a, b });
const STU = R('STUDENT'), COU = R('COURSE'), ENR = R('ENROLL'), INS = R('INSTRUCTOR'), TEA = R('TEACH'), ROO = R('ROOM'), ADV = R('ADVISE'), CLU = R('CLUB'), MEM = R('MEMBER'), PRE = R('PREREQ');
const cShow = c => c.replace(/>=/g, '≥').replace(/<=/g, '≤').replace(/ AND /g, ' ∧ ').replace(/ OR /g, ' ∨ ');
function show(x, top) { switch (x.t) { case 'r': return x.n; case 'j': return show(x.a) + ' ⋈ ' + show(x.b); case 's': return `σ_{${cShow(x.c)}}(${show(x.e, 1)})`; case 'p': return `π_{${x.p}}(${show(x.e, 1)})`;
    default: { const s = show(x.a) + { u: ' ∪ ', i: ' ∩ ', m: ' − ' }[x.t] + show(x.b); return top ? s : '(' + s + ')'; } } }
function sql(x) { const w = e => e.t === 'r' ? e.n : `(${sql(e)})`; switch (x.t) { case 'r': return `SELECT * FROM ${x.n}`; case 'j': return `SELECT * FROM ${w(x.a)} NATURAL JOIN ${w(x.b)}`; case 's': return `SELECT * FROM ${w(x.e)} WHERE ${x.c}`; case 'p': return `SELECT DISTINCT ${x.p} FROM ${w(x.e)}`;
    default: return `SELECT * FROM ${w(x.a)} ${{ u: 'UNION', i: 'INTERSECT', m: 'EXCEPT' }[x.t]} SELECT * FROM ${w(x.b)}`; } }
const DEPTS = ['CS', 'IS', 'SE', 'AI'], MAJORS = ['CS', 'IS', 'SE'], SEMS = ['2025_Spring', '2025_Fall', '2024_Fall'], TITLES = ['Database', 'AI', 'Networks', 'OS', 'Web', 'Security'], CLUBS = ['AI', 'Robotics', 'Music', 'Chess'], BUILDS = ['A', 'B', 'C'], GPAS = ['3.0', '3.5', '2.5'], CRS = [4, 3, 2];
const titleSet = t => Pr('SID', J(ENR, Sel(`Title='${t}'`, COU))), deptSet = d => Pr('SID', J(ENR, Sel(`Dept='${d}'`, COU))), semSet = s => Pr('SID', Sel(`Semester='${s}'`, ENR)), clubSet = c => Pr('SID', J(MEM, Sel(`ClubName='${c}'`, CLU)));
const raItems = [];
function ra(text, good, bad, e) { raItems.push({ text, good, bad, e }); }
for (let k = 0; k < 3; k++) {
  const d = DEPTS[k], d2 = DEPTS[k + 1], s = SEMS[k], s2 = SEMS[(k + 1) % 3], m = MAJORS[k], t = TITLES[k], t2 = TITLES[k + 1], g = GPAS[k], cr = CRS[k], c = CLUBS[k], c2 = CLUBS[k + 1], b = BUILDS[k], sq = `'${s}'`;
  { const con = `GPA>=${g} AND Title='${t}'`, jn = J(STU, ENR, COU); ra(`Lấy Name của sinh viên có GPA ≥ ${g} và đã đăng ký môn có Title là '${t}'.`, Pr('Name', Sel(con, jn)), [Sel(con, Pr('Name', jn)), Pr('Name', Sel(`GPA>=${g} OR Title='${t}'`, jn)), Pr('SID', Sel(con, jn))], 'Kết 3 bảng, chọn đồng thời hai điều kiện, rồi mới chiếu Name; chiếu trước sẽ mất cột cần lọc.'); }
  { const jn = J(COU, ENR); ra(`Lấy CID của các môn thuộc Dept='${d}' có ít nhất một đăng ký trong Semester=${sq}.`, Pr('CID', Sel(`Dept='${d}' AND Semester=${sq}`, jn)), [Mi(Pr('CID', Sel(`Dept='${d}'`, COU)), Pr('CID', Sel(`Semester=${sq}`, ENR))), Pr('CID', Sel(`Semester=${sq}`, ENR)), Un(Pr('CID', Sel(`Dept='${d}'`, COU)), Pr('CID', Sel(`Semester=${sq}`, ENR)))], 'Kết COURSE với ENROLL rồi chọn đồng thời Dept và Semester.'); }
  { const jn = J(COU, ENR); ra(`Lấy CID của các môn không thuộc Dept='${d}' nhưng có ít nhất một đăng ký trong Semester=${sq}.`, Pr('CID', Sel(`Dept<>'${d}' AND Semester=${sq}`, jn)), [Pr('CID', Sel(`Semester=${sq}`, ENR)), Un(Pr('CID', Sel(`Dept<>'${d}'`, COU)), Pr('CID', Sel(`Semester=${sq}`, ENR))), Pr('CID', Sel(`Dept='${d}' AND Semester=${sq}`, jn))], 'Hai điều kiện phải thỏa đồng thời nên dùng ∧; phép hợp chỉ cho “hoặc”.'); }
  { const a = Pr('Title', Sel(`Dept='${d}'`, COU)), bb = Pr('Title', Sel(`Dept='${d}'`, J(COU, ENR))); ra(`Lấy Title của các môn thuộc Dept='${d}' mà không có bất kỳ đăng ký nào (giả sử Title không trùng).`, Mi(a, bb), [bb, Mi(bb, a), In(a, bb)], 'Tập môn của khoa trừ đi tập môn của khoa đã có đăng ký.'); }
  { const a = semSet(s), bb = semSet(s2); ra(`Lấy SID của sinh viên có đăng ký cả hai học kỳ ${sq} và '${s2}'.`, In(a, bb), [Pr('SID', Sel(`Semester=${sq} AND Semester='${s2}'`, ENR)), Un(a, bb), Mi(a, bb)], 'Một bộ chỉ có một giá trị Semester nên phải giao hai tập SID.'); }
  { const a = semSet(s), bb = semSet(s2); ra(`Lấy SID của sinh viên đăng ký trong ${sq} nhưng KHÔNG đăng ký trong '${s2}'.`, Mi(a, bb), [Mi(bb, a), In(a, bb), Pr('SID', Sel(`Semester=${sq} AND Semester<>'${s2}'`, ENR))], 'Dùng phép trừ hai tập SID; điều kiện trên từng dòng không loại được sinh viên có dòng ở kỳ kia.'); }
  { const a = titleSet(t), bb = titleSet(t2); ra(`Lấy SID của sinh viên đã đăng ký CẢ HAI môn có Title là '${t}' và '${t2}'.`, In(a, bb), [Pr('SID', J(ENR, Sel(`Title='${t}' AND Title='${t2}'`, COU))), Un(a, bb), Mi(a, bb)], 'Một dòng COURSE không thể có hai Title nên phải giao hai tập.'); }
  { const i = In(clubSet(c), clubSet(c2)), jn = J(i, STU); ra(`Lấy Name của sinh viên là thành viên CẢ HAI CLB '${c}' và '${c2}'.`, Pr('Name', jn), [Pr('Name', J(Un(clubSet(c), clubSet(c2)), STU)), Pr('Name', J(Mi(clubSet(c), clubSet(c2)), STU)), Pr('Name', Sel(`ClubName='${c}' AND ClubName='${c2}'`, J(STU, MEM, CLU)))], 'Giao hai tập SID rồi kết STUDENT để lấy Name.'); }
  { ra(`Lấy Name của sinh viên có GPA ≥ ${g} và là thành viên CLB '${c}'.`, Pr('Name', J(Sel(`GPA>=${g}`, STU), MEM, Sel(`ClubName='${c}'`, CLU))), [Sel(`GPA>=${g}`, Pr('Name', J(STU, MEM, Sel(`ClubName='${c}'`, CLU)))), Pr('Name', Sel(`ClubName='${c}' AND GPA>=${g}`, STU)), Mi(Pr('Name', J(STU, MEM)), Pr('Name', Sel(`GPA>=${g}`, STU)))], 'Đẩy các phép chọn xuống bảng cơ sở rồi kết; ClubName không có trong STUDENT.'); }
  { const gr = ['F', 'A', 'D'][k], a = Pr('CID', ENR), bb = Pr('CID', Sel(`Grade='${gr}'`, ENR)), nb = Pr('CID', Sel(`Grade<>'${gr}'`, ENR)); ra(`Lấy CID của các môn có ít nhất một đăng ký nhưng không có bản ghi nào Grade='${gr}' (Grade có thể NULL).`, Mi(a, bb), [nb, In(a, nb), Mi(bb, a)], 'Lấy mọi môn có đăng ký trừ các môn có điểm đó; lọc Grade<> sẽ giữ môn có cả điểm đó và bỏ sót dòng NULL.'); }
  { const jn = J(INS, TEA, COU), con = `Credits>=${cr}`; ra(`Lấy IName của giảng viên đã dạy ít nhất một môn có Credits ≥ ${cr}.`, Pr('IName', Sel(con, jn)), [Sel(con, Pr('IName', jn)), Pr('IID', Sel(con, jn)), Mi(Pr('IName', INS), Pr('IName', Sel(con, jn)))], 'Kết 3 bảng, chọn trước, chiếu IName sau.'); }
  { const a = Pr('IID', Sel(`Dept='${d}' AND Semester=${sq}`, J(TEA, COU))), bb = Pr('IID', J(ADV, Sel(`Major='${m}'`, STU))); ra(`Lấy IName của giảng viên dạy ít nhất một môn Dept='${d}' trong ${sq} và cố vấn ít nhất một sinh viên Major='${m}'.`, Pr('IName', J(In(a, bb), INS)), [Pr('IName', J(Un(a, bb), INS)), Pr('IName', J(Mi(a, bb), INS)), Pr('IName', J(Mi(bb, a), INS))], 'Hai điều kiện đều phải đúng: giao hai tập IID rồi kết INSTRUCTOR.'); }
  { const jn = J(TEA, ROO, COU), con = `Building='${b}' AND Semester=${sq}`; ra(`Lấy Title của các môn được dạy tại Building='${b}' trong Semester=${sq}.`, Pr('Title', Sel(con, jn)), [Sel(con, Pr('Title', jn)), Pr('Title', Sel(`Building='${b}' OR Semester=${sq}`, jn)), Pr('CID', Sel(con, jn))], 'Kết TEACH, ROOM, COURSE; chọn hai điều kiện rồi chiếu Title.'); }
  { const a = deptSet(d), bb = deptSet(d2); ra(`Lấy SID của sinh viên đã đăng ký ít nhất một môn Dept='${d}' VÀ ít nhất một môn Dept='${d2}'.`, In(a, bb), [Pr('SID', J(ENR, Sel(`Dept='${d}' AND Dept='${d2}'`, COU))), Un(a, bb), Mi(a, bb)], 'Mỗi môn chỉ thuộc một Dept nên phải giao hai tập SID.'); }
  { const nb = Pr('SID', J(ENR, Sel(`Dept<>'${d}'`, COU))), a = Pr('SID', ENR); ra(`Lấy SID của sinh viên chỉ đăng ký các môn Dept='${d}' (không đăng ký môn ngoài ${d}).`, Mi(a, nb), [deptSet(d), Mi(nb, a), In(a, nb)], 'Mọi sinh viên có đăng ký trừ sinh viên có ít nhất một môn ngoài khoa đó.'); }
  { const jn = J(STU, ENR); ra(`Lấy CID của các môn có sinh viên Major='${m}' đăng ký trong Semester=${sq}.`, Pr('CID', Sel(`Major='${m}' AND Semester=${sq}`, jn)), [Pr('CID', Sel(`Major='${m}' OR Semester=${sq}`, jn)), Sel(`Major='${m}' AND Semester=${sq}`, Pr('CID', jn)), Pr('SID', Sel(`Major='${m}' AND Semester=${sq}`, jn))], 'Major ở STUDENT, Semester và CID ở ENROLL nên phải kết hai bảng.'); }
  { const jn = J(STU, ENR, COU); ra(`Lấy Title của các môn Dept<>'${d}' nhưng có ít nhất một sinh viên Major='${m}' đăng ký.`, Pr('Title', Sel(`Major='${m}' AND Dept<>'${d}'`, jn)), [Pr('Title', Sel(`Major='${m}' OR Dept<>'${d}'`, jn)), Pr('Title', Sel(`Major='${m}' AND Dept='${d}'`, jn)), Pr('Name', Sel(`Major='${m}' AND Dept<>'${d}'`, jn))], 'Kết 3 bảng và chọn đồng thời hai điều kiện.'); }
  { const jn = J(STU, ENR, COU); ra(`Lấy Name của sinh viên Major<>'${m}' nhưng đã đăng ký ít nhất một môn Dept='${d}'.`, Pr('Name', Sel(`Major<>'${m}' AND Dept='${d}'`, jn)), [Pr('Name', Sel(`Major='${m}' AND Dept='${d}'`, jn)), Pr('Name', Sel(`Major<>'${m}' OR Dept='${d}'`, jn)), Pr('Name', Sel(`Major<>'${m}' AND Dept<>'${d}'`, jn))], 'Điều kiện trên STUDENT và COURSE áp dụng đồng thời trên bảng đã kết.'); }
  { ra(`Lấy Title của các môn Dept='${d}' có ít nhất một môn tiên quyết (bảng PREREQ).`, Pr('Title', Sel(`Dept='${d}'`, J(COU, PRE))), [Pr('Title', Sel(`Dept='${d}'`, COU)), Mi(Pr('Title', Sel(`Dept='${d}'`, COU)), Pr('Title', J(COU, PRE))), Pr('PreCID', Sel(`Dept='${d}'`, J(COU, PRE)))], 'PREREQ chỉ chứa các môn có tiên quyết, kết tự nhiên theo CID sẽ giữ đúng các môn đó.'); }
  { const iid = ['I01', 'I02', 'I03'][k]; ra(`Lấy Title của các môn được đăng ký bởi sinh viên được cố vấn bởi giảng viên có IID='${iid}'.`, Pr('Title', J(Sel(`IID='${iid}'`, ADV), ENR, COU)), [Pr('Title', J(Sel(`IID='${iid}'`, TEA), COU)), Pr('Title', J(Sel(`IID<>'${iid}'`, ADV), ENR, COU)), Sel(`IID='${iid}'`, Pr('Title', J(ADV, ENR, COU)))], 'Lọc ADVISE theo IID, kết ENROLL theo SID rồi kết COURSE theo CID.'); }
  { const a = titleSet(t), bb = titleSet(t2); ra(`Lấy SID của sinh viên đăng ký CHỈ MỘT TRONG HAI môn '${t}' hoặc '${t2}' (đúng 1 trong 2).`, Mi(Un(a, bb), In(a, bb)), [Un(a, bb), In(a, bb), Mi(In(a, bb), Un(a, bb))], 'Hiệu đối xứng: hợp trừ giao.'); }
  { const all = Pr('SID,Name', STU), got = Pr('SID,Name', J(STU, Sel(`Semester=${sq}`, ENR))); ra(`Lấy (SID, Name) của sinh viên KHÔNG đăng ký trong Semester=${sq}.`, Mi(all, got), [got, Mi(got, all), Pr('SID,Name', J(STU, Sel(`Semester<>${sq}`, ENR)))], 'Mọi sinh viên trừ sinh viên có đăng ký kỳ đó; điều kiện <> vẫn giữ người có đăng ký thêm kỳ khác.'); }
  { const con = `Dept='${d}' OR Dept='${d2}'`, a = Pr('CID', Sel(con, COU)), bb = Pr('CID', Sel(`Semester=${sq} AND (${con})`, J(COU, ENR))); ra(`Lấy CID của các môn thuộc Dept='${d}' hoặc Dept='${d2}' mà không có đăng ký trong ${sq}.`, Mi(a, bb), [bb, Mi(bb, a), Pr('CID', Sel(`Semester<>${sq} AND (${con})`, J(COU, ENR)))], 'Tập môn của hai khoa trừ tập môn đã có đăng ký kỳ đó.'); }
  { const jn = J(COU, ENR), a = Pr('CID', Sel(`Dept='${d}' AND Semester=${sq}`, jn)), bb = Pr('CID', Sel(`Dept='${d}' AND Semester='${s2}'`, jn)); ra(`Lấy CID của các môn Dept='${d}' có đăng ký trong ${sq} nhưng không có đăng ký trong '${s2}'.`, Mi(a, bb), [Mi(bb, a), In(a, bb), Un(a, bb)], 'Có trong tập đầu và không có trong tập sau: dùng phép trừ.'); }
  { const jn = J(STU, ENR, COU), con = `Credits>=${cr} AND Semester=${sq}`; ra(`Lấy (SID, Name) của sinh viên đăng ký môn có Credits ≥ ${cr} trong Semester=${sq}.`, Pr('SID,Name', Sel(con, jn)), [Sel(con, Pr('SID,Name', jn)), Pr('SID,Name', Sel(`Credits>=${cr} OR Semester=${sq}`, jn)), Pr('SID,Name', Sel(con, STU))], 'Credits ở COURSE, Semester ở ENROLL nên phải kết đủ 3 bảng.'); }
  { const jn = J(STU, ENR), con = `GPA>${g}`; ra(`Lấy (SID, CID) của các đăng ký thuộc sinh viên có GPA > ${g}.`, Pr('SID,CID', Sel(con, jn)), [Sel(con, Pr('SID,CID', jn)), Pr('SID,CID', Sel(con, ENR)), Pr('SID,Name', Sel(con, jn))], 'Phải chọn theo GPA trước khi chiếu; ENROLL không có cột GPA.'); }
}

// Dữ liệu kiểm thử để chạy thật các biểu thức: mỗi phương án nhiễu phải lỗi hoặc cho kết quả khác đáp án đúng.
async function checkRA() {
  const initSqlJs = require(path.join(ROOT, 'lib', 'sql-asm.js')), SQL = await initSqlJs(); let bad = 0;
  const dbs = [1, 2, 3, 4, 5, 6].map(s0 => { let s = s0 * 7919; const r = n => { s = (s * 1103515245 + 12345) & 0x7fffffff; return (s >> 8) % n; };
    const db = new SQL.Database(); db.run(`CREATE TABLE STUDENT(SID,Name,Major,GPA);CREATE TABLE COURSE(CID,Title,Dept,Credits);CREATE TABLE ENROLL(SID,CID,Semester,Grade);CREATE TABLE INSTRUCTOR(IID,IName,Office);CREATE TABLE TEACH(IID,CID,Semester,Room);CREATE TABLE ROOM(Room,Building);CREATE TABLE ADVISE(IID,SID);CREATE TABLE CLUB(ClubID,ClubName);CREATE TABLE MEMBER(SID,ClubID);CREATE TABLE PREREQ(CID,PreCID);`);
    const q = v => v === null ? 'NULL' : typeof v === 'number' ? v : `'${v}'`, ins = (t, ...v) => db.run(`INSERT INTO ${t} VALUES(${v.map(q).join(',')})`);
    const ALLT = [...TITLES, 'Compiler', 'ML', 'Graphics', 'Algebra', 'Calculus', 'Physics', ...Array.from({length:24},(_,i)=>'Topic'+i)], ALLD = [...DEPTS, 'MA'];
    for (let i = 0; i < 40; i++) ins('STUDENT', 'S' + i, 'N' + i, MAJORS[r(3)], [2.2, 2.5, 2.8, 3.0, 3.2, 3.5, 3.8][r(7)]);
    ALLT.forEach((t, i) => ins('COURSE', 'C' + i, t, i < 8 ? ALLD[i % 4] : ALLD[r(5)], [2, 3, 4][r(3)]));
    // Dữ liệu thưa: có môn chưa ai học, môn chỉ mở một kỳ, sinh viên chỉ học trong một khoa.
    const open = ALLT.map((_, i) => (i % 5 === 4 ? [] : i % 3 === 0 ? [SEMS[r(3)]] : (x => x.length ? x : [SEMS[r(3)]])(SEMS.filter(() => r(2)))));
    const dept = db.exec('SELECT CID,Dept FROM COURSE')[0].values, seen = new Set();
    for (let i = 0; i < 40; i++) { const only = r(2) ? ALLD[r(4)] : null, n = 1 + r(6); for (let j = 0; j < n; j++) { const pool = dept.filter(d => !only || d[1] === only).map(d => d[0]); const cid = pool[r(pool.length)], sems = open[+cid.slice(1)]; if (!sems.length) continue; const sem = sems[r(sems.length)], k = `S${i}|${cid}|${sem}`; if (seen.has(k)) continue; seen.add(k); ins('ENROLL', 'S' + i, cid, sem, [null, 'A', 'B', 'C', 'D', 'F'][r(6)]); } }
    for (let i = 0; i < 5; i++) { ins('ENROLL', 'S' + i, 'C' + i, SEMS[r(3)], 'B'); ins('ENROLL', 'S' + i, 'C' + (i + 1), SEMS[r(3)], 'A'); ins('ENROLL', 'S' + (10 + i), 'C' + i, SEMS[r(3)], 'C'); }
    ['I01', 'I02', 'I03', 'I04', 'I05'].forEach((x, i) => ins('INSTRUCTOR', x, 'T' + i, 'O' + i));
    ['R1', 'R2', 'R3', 'R4'].forEach((x, i) => ins('ROOM', x, BUILDS[i % 3]));
    for (let i = 0; i < 40; i++) ins('TEACH', 'I0' + (1 + r(5)), 'C' + r(ALLT.length), SEMS[r(3)], 'R' + (1 + r(4)));
    for (let i = 0; i < 30; i++) ins('ADVISE', 'I0' + (1 + r(5)), 'S' + r(40));
    CLUBS.forEach((x, i) => ins('CLUB', 'K' + i, x)); for (let i = 0; i < 50; i++) ins('MEMBER', 'S' + r(40), 'K' + r(4));
    for (let i = 0; i < 8; i++) ins('PREREQ', 'C' + r(ALLT.length), 'C' + r(ALLT.length)); return db; });
  const run = (db, x) => { try { const r = db.exec(sql(x))[0]; return JSON.stringify((r ? r.values : []).map(v => v.join('|')).sort()); } catch (e) { return 'ERR'; } };
  for (const it of raItems) { const g = dbs.map(d => run(d, it.good)); if (g.includes('ERR') || g.every(x => x === '[]')) { bad++; console.log('ĐÁP ÁN LỖI/RỖNG:', it.text, g[0].slice(0, 80)); }
    it.bad.forEach((b, i) => { const v = dbs.map(d => run(d, b)); if (!v.includes('ERR') && v.every((x, j) => x === g[j])) { bad++; console.log('NHIỄU TRÙNG ĐÁP ÁN:', it.text, '#' + i, show(b, 1)); } }); }
  return bad;
}
const SCHEMA_NOTE = 1;
const algebra = [...kept.algebra];
algebra.push(
{q:"Đẳng thức ngữ nghĩa nào dưới đây luôn đúng trong đại số quan hệ?",o:["σ_{θ}(σ_{θ}(R)) = σ_{θ}(R)","π_{X}(π_{Y}(R)) = π_{Y}(π_{X}(R)) với mọi X, Y","σ_{θ}(R) = R với mọi θ","π_{X}(R) = R với mọi X"],e:"Phép chọn lũy đẳng; các đẳng thức còn lại chỉ đúng trong điều kiện đặc biệt."},
{q:"Với quan hệ E, mệnh đề tương đương nào đúng? σ_{age>30}(σ_{dept='IT'}(E)) = ?",o:["σ_{age>30 ∧ dept='IT'}(E)","σ_{age>30 ∨ dept='IT'}(E)","σ_{age>30}(E) ∪ σ_{dept='IT'}(E)","σ_{age>30}(E) − σ_{dept='IT'}(E)"],e:"Các phép chọn lồng nhau gộp thành điều kiện ∧."},
{q:"Tính phân phối đúng của phép chọn trên quan hệ tạo bởi phép hợp:",o:["σ_{θ}(R ∪ S) = σ_{θ}(R) ∪ σ_{θ}(S)","σ_{θ}(R ∪ S) = σ_{θ}(R) ∩ σ_{θ}(S)","σ_{θ}(R ∪ S) = σ_{θ}(R) ∪ S","σ_{θ}(R ∪ S) = R ∪ σ_{θ}(S)"],e:"Phép chọn phân phối trên phép hợp."},
{q:"Với R(A,B), S(B,C). Đẩy phép chiếu qua phép nối: π_{A,C}(R ⋈ S) = ?",o:["π_{A,C}((π_{A,B}(R)) ⋈ (π_{B,C}(S)))","π_{A}(R) ⋈ π_{C}(S)","π_{A,C}(π_{A}(R) ⋈ π_{C}(S))","π_{B}(R) ⋈ π_{B}(S)"],e:"Phải giữ thuộc tính nối B; bỏ B sớm sẽ biến phép nối thành tích Descartes."},
{q:"Với R(A,B), S(B,C). Biểu thức nào trả về đúng các bộ của R không có giá trị B khớp trong S?",o:["R − π_{A,B}(R ⋈ S)","π_{A,B}(R ⋈ S)","R ⋈ S","π_{A,B}(R ⋈ S) − R"],e:"π_{A,B}(R ⋈ S) là các bộ của R khớp với S; trừ đi còn các bộ không khớp."},
{q:"RA làm việc theo ngữ nghĩa tập hợp (set semantics). Phép SQL tương ứng với hợp trong RA là:",o:["UNION","UNION ALL","INTERSECT","NATURAL JOIN"],e:"UNION loại bản ghi trùng; UNION ALL giữ trùng theo ngữ nghĩa đa tập."},
{q:"Khác biệt giữa UNION và UNION ALL trong SQL là:",o:["UNION loại các dòng trùng, UNION ALL giữ các dòng trùng","UNION giữ các dòng trùng, UNION ALL loại các dòng trùng","UNION chỉ dùng cho hai bảng, UNION ALL dùng cho nhiều bảng","Hai toán tử hoàn toàn giống nhau"],e:"UNION tương ứng ngữ nghĩa tập hợp của RA."},
{q:"Biểu thức σ_{Semester='2025_Spring' ∧ Semester='2025_Fall'}(ENROLL) cho kết quả:",o:["Luôn rỗng, vì một bộ chỉ có một giá trị Semester","Các đăng ký thuộc một trong hai học kỳ","Các sinh viên học cả hai học kỳ","Toàn bộ ENROLL"],e:"Điều kiện được xét trên từng bộ."},
{q:"Cho S_DB: tập SID đăng ký môn 'Database', S_AI: tập SID đăng ký môn 'AI'. SID đăng ký đúng 1 trong 2 môn là:",o:["(S_DB ∪ S_AI) − (S_DB ∩ S_AI)","S_DB ∪ S_AI","S_DB ∩ S_AI","(S_DB ∩ S_AI) − (S_DB ∪ S_AI)"],e:"Hiệu đối xứng."},
{q:"Vì sao σ_{GPA>3.0}(π_{SID}(STUDENT)) không hợp lệ?",o:["Sau khi chiếu chỉ còn cột SID nên không còn GPA để lọc","Phép chọn không dùng được với phép chiếu trong mọi trường hợp","SID không phải khóa chính của STUDENT","Phải dùng phép chia thay cho phép chọn"],e:"Phải chọn trước, chiếu sau."},
{q:"Với điều kiện c chỉ dùng thuộc tính của R, σ_{c}(R × S) bằng:",o:["σ_{c}(R) × S","R × σ_{c}(S)","σ_{c}(R) ∪ S","σ_{c}(S)"],e:"Đẩy phép chọn xuống đúng quan hệ chứa thuộc tính."},
{q:"COURSE(CID, Title, Dept, Credits) ⋈ ENROLL(SID, CID, Semester, Grade) ghép theo thuộc tính nào?",o:["CID","SID","Semester","Mọi thuộc tính của hai bảng"],e:"Kết tự nhiên so bằng trên thuộc tính cùng tên."},
{q:"TEACH(IID, CID, Semester, Room) ⋈ ENROLL(SID, CID, Semester, Grade) ghép theo:",o:["CID và Semester","Chỉ CID","Chỉ Semester","IID và SID"],e:"Mọi thuộc tính cùng tên đều tham gia so bằng."},
{q:"R − S = ∅ khi và chỉ khi:",o:["R ⊆ S","S ⊆ R","R ∩ S = ∅","R = ∅ và S = ∅"],e:"Mọi bộ của R đều có trong S."},
);

// ===================== PHẦN 5: DẠNG CHUẨN =====================
function highestNF(r, F) { const ks = keysOf(r, F), prime = new Set(ks.join('')), sk = x => closure(x, F).size === r.length; let two = true;
  for (const k of ks) for (const s of subs([...k])) if (s.length < k.length) for (const a of closure(s, F)) if (!prime.has(a) && !s.includes(a)) two = false;
  if (!two) return '1NF'; let three = true, bc = true; for (const [l, rr] of F) for (const a of rr) { if (l.includes(a)) continue; if (!sk(l)) { bc = false; if (!prime.has(a)) three = false; } } return !three ? '2NF' : !bc ? '3NF' : 'BCNF'; }
const nf = [...kept.nf], NFO = ['1NF', '2NF', '3NF', 'BCNF'], need = { '1NF': 9, '2NF': 9, '3NF': 9, BCNF: 9 };
const taken = new Set();
while (Object.values(need).some(v => v > 0)) { const n = 3 + ri(4), R0 = 'ABCDEF'.slice(0, n), { F } = randF(n); const k = toV(F); if (taken.has(k)) continue; const lvl = highestNF(R0, F); if (!(need[lvl] > 0)) continue; if (lvl === '3NF' && keysOf(R0, F).length < 2) continue; taken.add(k); need[lvl]--;
  const ks = pretty(keysOf(R0, F)); nf.push({ q: `R(${[...R0].join(',')}), F={${toStr(F)}}, R đã đạt 1NF. Dạng chuẩn cao nhất của R:`, v: { f: toV(F), r: R0, nf: lvl }, o: [lvl, ...NFO.filter(x => x !== lvl)].map(x => 'Cao nhất là ' + x), e: `Khóa ứng viên: ${ks}. Kiểm tra lần lượt phụ thuộc bộ phận, phụ thuộc bắc cầu và điều kiện siêu khóa.` }); }
const NFV = [['ABCD', 'A', 'BCD', 'C', 'D'], ['ABCDE', 'A', 'BCDE', 'D', 'E'], ['ABCD', 'B', 'ACD', 'D', 'A'], ['ABCDE', 'C', 'ABDE', 'B', 'E'], ['ABCDE', 'E', 'ABCD', 'A', 'C'], ['ABCD', 'D', 'ABC', 'A', 'B']];
for (const [R0, k, rest, x, y] of NFV) { const F = [[k, rest], [x, y]]; nf.push({ q: `R(${[...R0].join(',')}), F={${toStr(F)}}. Phụ thuộc nào vi phạm BCNF?`, v: { f: toV(F), r: R0, bv: 1 }, o: [`${x}→${y}`, ...[...rest].slice(0, 3).map(a => `${k}→${a}`)], e: `${x} không là siêu khóa của R, còn ${k} là khóa.` }); }

// ===================== GHI FILE =====================
(async () => {
  const bad = await checkRA();
  for (const it of raItems.slice(0, 75)) algebra.push({ q: it.text, sc: SCHEMA_NOTE, o: [show(it.good, 1), ...it.bad.map(b => show(b, 1))], e: it.e });
  const write = (file, key, list) => fs.writeFileSync(path.join(ROOT, 'data', file), `// Sinh bởi tools/generate_bank.js. o[0] luôn đúng; thứ tự xáo khi hiển thị.\nwindow.QB = window.QB || {};\nQB.${key} = [\n${list.map(q => JSON.stringify(q)).join(',\n')}\n];\n`);
  write('q1_mapping.js', 'mapping', mapping); write('q2_design.js', 'design', design); write('q3_fd.js', 'fd', fd); write('q4_algebra.js', 'algebra', algebra); write('q5_nf.js', 'nf', nf);
  console.log({ mapping: mapping.length, design: design.length, fd: fd.length, algebra: algebra.length, nf: nf.length, raPool: raItems.length, raProblems: bad });
})();
