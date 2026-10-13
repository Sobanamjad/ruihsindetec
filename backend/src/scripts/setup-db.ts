import 'dotenv/config';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

async function setupDatabase() {
  try {
    console.log('Setting up database...');

    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_content (
        id SERIAL PRIMARY KEY,
        section VARCHAR(50) UNIQUE NOT NULL,
        content JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Created site_content table');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Created users table');

    // Hash the admin password
    const passwordHash = await bcrypt.hash('admin123', 10);

    // Insert default admin user
    await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING',
      ['admin', passwordHash]
    );
    console.log('✓ Created admin user (username: admin, password: admin123)');

    // Insert default content
    const defaultContent = {
      site: {
        site_name: '瑞信徵信社',
        site_description: '專業資訊調查與風險評估',
        site_logo: '',
        favicon: '',
      },
      hero: {
        tag: '專業資訊調查與風險評估',
        title: '瑞信徵信社｜專業調查、合法程序、重視保密',
        subtitle: '專業調查｜合法程序｜重視保密',
        description: '面對關係疑慮、商業合作與重要決策，正確資訊是釐清問題的第一步。瑞信徵信社透過專業資訊整理與合法調查程序，協助個人與企業掌握事實、降低風險。',
        image: '/hero.png',
        badges: ['專業分析', '合法程序', '客觀評估', '資訊保密'],
        buttons: [
          { label: '立即諮詢', href: '#contact', variant: 'primary' },
          { label: '了解服務', href: '#services', variant: 'secondary' },
        ],
      },
      menu: {
        items: [
          { label: '首頁', href: '#home' },
          { label: '關於瑞信', href: '#about' },
          { label: '服務項目', href: '#services' },
          { label: '服務流程', href: '#process' },
          { label: '即時新聞', href: '#news' },
          { label: '徵信知識', href: '#knowledge' },
          { label: '常見問題', href: '#faq' },
          { label: '聯絡諮詢', href: '#contact' },
          { label: '立即諮詢', href: '#contact', variant: 'primary' },
        ],
      },
      footer: {
        logo: '瑞信徵信社',
        description: '提供婚姻徵信、商業調查與企業風險管理相關服務，協助個人與企業釐清資訊、降低風險。',
        nav_items: [
          { label: '關於瑞信', href: '#about' },
          { label: '服務項目', href: '#services' },
          { label: '服務流程', href: '#process' },
          { label: '即時新聞', href: '#news' },
          { label: '徵信知識', href: '#knowledge' },
          { label: '常見問題', href: '#faq' },
          { label: '聯絡諮詢', href: '#contact' },
        ],
        disclaimer: '本網站內容為一般資訊與服務介紹，不構成法律意見。實際案件應依個別情況進行評估，必要時應諮詢專業律師。',
        copyright: '© 2026 瑞信徵信社 All Rights Reserved.',
      },
      needs: {
        tag: '常見需求',
        title: '當資訊不足，重要決定往往更加困難',
        description: '有些疑問無法只靠猜測確認，有些合作也不能只憑表面資訊判斷。瑞信從實際需求出發，協助整理資訊、確認方向，逐步釐清問題。',
        cards: [
          {
            title: '關係中的疑慮',
            description: '當關係出現異常或資訊不一致時，透過合法方式了解狀況，避免在情緒與猜測中做出決定。',
          },
          {
            title: '合作前的查核',
            description: '在建立合作、交易或委任關係前，先了解相關背景資訊，降低資訊不對稱造成的風險。',
          },
          {
            title: '企業決策風險',
            description: '面對重要商業決策時，透過資訊整理與風險分析，提高決策的完整度與安全性。',
          },
        ],
      },
      about: {
        tag: '關於瑞信',
        title: '以事實為基礎，協助您做出更清楚的判斷',
        paragraphs: [
          '瑞信徵信社以專業、客觀與保密為服務原則，提供婚姻徵信、商業調查及企業風險管理相關服務。',
          '我們重視每一項委託背後的實際需求，從初步諮詢、問題評估到資訊整理，皆以合法程序與謹慎態度進行。',
          '徵信服務的目的，不是製造衝突，而是協助委託人降低資訊落差、釐清事實，為後續行動提供更完整的判斷依據。',
        ],
        quote: '真相，是每一次正確決策的開始。',
      },
      services: {
        tag: '服務項目',
        title: '個人與企業的專業調查服務',
        description: '依照不同情境與需求，提供適合的資訊調查與風險評估方向。',
        cards: [
          {
            title: '婚姻徵信',
            subtitle: '婚姻與關係資訊釐清',
            image: '/marriage.jpg',
            description: '當婚姻或伴侶關係出現疑慮時，單靠猜測容易加深不安與衝突。瑞信協助委託人整理需求，透過合法程序了解相關資訊。',
            list_items: [
              '婚姻狀況相關資訊確認',
              '關係疑問與異常情況釐清',
              '婚前背景資訊了解',
              '合法蒐證方向諮詢',
              '家庭與關係問題資訊整理',
            ],
            button_label: '了解婚姻徵信',
            button_href: '#contact',
          },
          {
            title: '商業調查',
            subtitle: '合作之前，先了解潛在風險',
            image: '/business.jpg',
            description: '商業合作常伴隨資訊不對稱。瑞信協助企業與個人進行合作前資訊查核，整理可取得的背景資訊與潛在風險。',
            list_items: [
              '合作對象背景資訊查核',
              '商業合作風險評估',
              '企業與廠商資訊整理',
              '合作前基本盡職調查',
              '商業爭議相關資訊釐清',
            ],
            button_label: '了解商業調查',
            button_href: '#contact',
          },
          {
            title: '企業風險管理',
            subtitle: '為重要決策補足關鍵資訊',
            image: '/risk.jpg',
            description: '企業在合作、管理或重大決策前，若缺乏足夠資訊，容易低估潛在風險。瑞信透過資訊整理、背景查核與風險分析協助企業。',
            list_items: [
              '企業背景與關係資訊整理',
              '合作風險初步評估',
              '重要決策前資訊查核',
              '異常情況與爭議資訊分析',
              '企業安全與風險管理諮詢',
            ],
            button_label: '了解企業風險管理',
            button_href: '#contact',
          },
        ],
      },
      principles: {
        tag: '服務原則',
        title: '每一項委託，都需要更謹慎的處理',
        cards: [
          {
            icon: 'scale',
            title: '合法程序',
            description: '依照實際需求評估可行方向，重視法律界線與合法資訊取得方式。',
          },
          {
            icon: 'lock',
            title: '重視保密',
            description: '重視委託內容與個人資訊，降低敏感資料在服務過程中的暴露風險。',
          },
          {
            icon: 'chart',
            title: '客觀分析',
            description: '以可確認的資訊為基礎，協助委託人釐清事實，不以猜測取代判斷。',
          },
          {
            icon: 'clipboard',
            title: '需求評估',
            description: '不同案件有不同背景與目的，先理解問題，再規劃適合的處理方向。',
          },
        ],
      },
      process: {
        tag: '服務流程',
        title: '從需求確認開始，逐步釐清問題',
        steps: [
          {
            number: '01',
            title: '初步諮詢',
            description: '了解目前遇到的狀況、疑問與希望確認的資訊。',
          },
          {
            number: '02',
            title: '需求評估',
            description: '評估案件方向、資訊條件與可採取的合法處理方式。',
          },
          {
            number: '03',
            title: '確認服務內容',
            description: '說明預計進行的工作項目、範圍與注意事項。',
          },
          {
            number: '04',
            title: '資訊整理與分析',
            description: '依照確認方向進行資訊蒐集、查核與內容整理。',
          },
          {
            number: '05',
            title: '結果說明',
            description: '說明已整理的資訊與可供後續判斷的重點。',
          },
        ],
        note: '每項委託的情況、可取得資訊與處理方式皆不同，實際服務內容需經初步評估後確認。',
      },
      knowledge: {
        tag: '徵信知識',
        title: '先了解，再決定下一步',
        description: '透過基礎徵信、蒐證與商業風險知識，協助您在尋求服務前建立正確觀念。',
        cards: [
          {
            title: '徵信服務是否合法？',
            description: '徵信服務本身並不代表可以使用任何方式取得資訊，實際調查仍應遵守相關法律規範。',
          },
          {
            title: '外遇調查需要注意哪些法律問題？',
            description: '蒐集資訊時應注意隱私權、個人資料及相關法律界線，並非所有方式都能合法使用。',
          },
          {
            title: '商業合作前為什麼需要背景調查？',
            description: '合作前查核有助了解對方背景與潛在風險，降低資訊不對稱造成的合作損失。',
          },
          {
            title: '企業如何降低合作風險？',
            description: '除了契約審查，也應重視合作對象背景、履約能力與過往爭議資訊。',
          },
        ],
        cta: {
          label: '查看更多徵信知識 →',
          href: '#contact',
        },
      },
      faq: {
        tag: '常見問題',
        title: '諮詢前，先了解常見疑問',
        items: [
          {
            question: '找徵信社是否合法？',
            answer: '徵信社本身是合法的行業，但必須遵守相關法律規定，不得使用非法手段獲取資訊。',
          },
          {
            question: '委託內容會不會外洩？',
            answer: '瑞信徵信社高度重視保密，所有委託內容均嚴格保護，不會向第三方透露。',
          },
          {
            question: '可以保證一定查到結果嗎？',
            answer: '調查結果取決於多種因素，我們會盡全力調查，但無法保證特定結果。',
          },
          {
            question: '諮詢時需要準備哪些資料？',
            answer: '建議準備相關背景資訊、已知線索及您希望釐清的問題清單。',
          },
          {
            question: '企業也可以委託徵信服務嗎？',
            answer: '是的，我們為企業提供商業調查和風險管理服務。',
          },
          {
            question: '費用如何計算？',
            answer: '費用根據案件複雜程度、所需時間和資源而定，請聯繫我們進行評估。',
          },
        ],
      },
      cta: {
        title: '需要協助釐清資訊？',
        description: '面對不確定的關係、合作或企業風險，先了解問題與可行方向，再決定下一步。瑞信徵信社提供專業、客觀且重視保密的初步諮詢服務。',
        button: {
          label: '立即聯絡瑞信',
          href: '#contact',
        },
        note: '聯絡方式、電話、LINE 與服務時間待品牌資料確認後補充。',
      },
      contact: {
        tag: '聯絡諮詢',
        title: '填寫初步諮詢需求',
        note: '請勿在尚未確認聯絡管道安全前，填寫過度敏感或可識別第三人的完整資料。',
        service_options: [
          '婚姻徵信',
          '商業調查',
          '企業風險管理',
          '其他需求',
        ],
      },
    };

    for (const [section, content] of Object.entries(defaultContent)) {
      await pool.query(
        'INSERT INTO site_content (section, content) VALUES ($1, $2) ON CONFLICT (section) DO NOTHING',
        [section, JSON.stringify(content)]
      );
    }
    console.log('✓ Created default content');

    console.log('\n✓ Database setup complete!');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
