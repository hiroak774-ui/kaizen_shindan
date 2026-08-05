const TIMEREX_URL = "https://timerex.net/s/kit19940501_5670/4a24126b/";
    const GAS_URL = "https://script.google.com/macros/s/AKfycbyQbpgrWzkKCBfFwYKHPRoxByu8bBGlkOJ9ivgp3Rzp372KW1ItNpKWDYR0zWbfa8gsDg/exec";

    const questions = [
      {
        id: "routine",
        title: "日々の業務で、繰り返し発生する作業はどのくらいありますか？",
        note: "最も近いものを1つ選んでください。",
        options: [
          { label: "かなり多い", sub: "毎日、複数の定型作業に時間を取られている", value: "many", scores: { transfer: 1, manual: 4, ai: 1 } },
          { label: "いくつかある", sub: "週に何度か、同じ手順を繰り返している", value: "some", scores: { transfer: 1, manual: 2, ai: 1 } },
          { label: "あまりない", sub: "定型作業より、個別対応が中心", value: "few", scores: { transfer: 0, manual: 0, ai: 0 } }
        ]
      },
      {
        id: "transfer",
        title: "同じ情報を、複数の場所へ入力・転記することはありますか？",
        note: "Excel、メール、チャット、社内システムなどを含みます。",
        options: [
          { label: "ほぼ毎日ある", sub: "二重入力やコピペが日常的に発生している", value: "high", scores: { transfer: 5, manual: 1, ai: 0 } },
          { label: "週に数回ある", sub: "定期的に転記や集計が発生している", value: "mid", scores: { transfer: 3, manual: 1, ai: 0 } },
          { label: "ほとんどない", sub: "一度の入力で業務が完結することが多い", value: "low", scores: { transfer: 0, manual: 0, ai: 0 } }
        ]
      },
      {
        id: "aiUsage",
        title: "ChatGPTなどの生成AIを、業務でどの程度使っていますか？",
        note: "会社としての利用状況に最も近いものを選んでください。",
        options: [
          { label: "ほとんど使っていない", sub: "個人利用も含め、業務ではほぼ未導入", value: "none", scores: { transfer: 0, manual: 0, ai: 5 } },
          { label: "一部の人だけ使っている", sub: "文章作成や調査などで個人差がある", value: "partial", scores: { transfer: 0, manual: 1, ai: 3 } },
          { label: "会社・チームで使っている", sub: "一定のルールや活用例がある", value: "active", scores: { transfer: 0, manual: 0, ai: 1 } }
        ]
      }
    ];

    const branchQuestions = {
      none: {
        id: "aiBranch",
        title: "AIを使っていない一番大きな理由は何ですか？",
        note: "導入の障壁を確認し、最初の一歩を診断します。",
        options: [
          { label: "何に使えるか分からない", sub: "具体的な活用イメージがまだない", value: "unknown", scores: { transfer: 0, manual: 0, ai: 3 } },
          { label: "情報管理や安全面が不安", sub: "社内ルールや利用基準が決まっていない", value: "security", scores: { transfer: 0, manual: 0, ai: 2 } },
          { label: "試す時間・担当者がいない", sub: "導入検討まで手が回っていない", value: "resource", scores: { transfer: 0, manual: 2, ai: 2 } }
        ]
      },
      partial: {
        id: "aiBranch",
        title: "AI活用が一部の人に留まっている理由は何ですか？",
        note: "定着を妨げているポイントに最も近いものを選んでください。",
        options: [
          { label: "人によって使い方に差がある", sub: "得意な人だけが活用している", value: "skill_gap", scores: { transfer: 0, manual: 1, ai: 2 } },
          { label: "便利な使い方が共有されていない", sub: "活用例やプロンプトが属人化している", value: "not_shared", scores: { transfer: 0, manual: 1, ai: 2 } },
          { label: "日常業務に組み込めていない", sub: "試してはいるが、継続利用につながっていない", value: "not_embedded", scores: { transfer: 1, manual: 1, ai: 3 } }
        ]
      },
      active: {
        id: "aiBranch",
        title: "現在のAI活用で、もっと改善したいことは何ですか？",
        note: "次の改善段階に近いものを選んでください。",
        options: [
          { label: "定型業務まで自動化したい", sub: "AIとツールをつなぎ、作業自体を減らしたい", value: "automation", scores: { transfer: 2, manual: 1, ai: 1 } },
          { label: "チーム全体に定着させたい", sub: "活用方法やルールを標準化したい", value: "adoption", scores: { transfer: 0, manual: 1, ai: 1 } },
          { label: "効果を見える化したい", sub: "時間削減や成果を数値で把握したい", value: "measurement", scores: { transfer: 0, manual: 0, ai: 1 } }
        ]
      }
    };

    const patterns = {
      "P01-A": { patternId:"P01", type:"手作業過多型", stars:5, lead:"繰り返し作業の量が多く、まずは手作業そのものを減らす余地があります。", priorities:["定型業務","作業時間","標準化"], improvements:["定型作業の棚卸し","繰り返し業務のテンプレート化","入力フォームの統一","作業手順の標準化","定型通知の自動化"] },
      "P02-A": { patternId:"P02", type:"転記・入力過多型", stars:5, lead:"同じ情報を複数の場所へ入力しているため、転記削減の効果が出やすい状態です。", priorities:["転記・入力","集計","業務自動化"], improvements:["入力フォームの一本化","Excel集計の自動化","転記先の整理","定型報告書の自動作成","入力ミス・重複チェックの自動化"] },
      "P02-B": { patternId:"P02", type:"転記・入力過多型", stars:5, lead:"転記削減に加え、現在のAI活用を業務フローへ組み込むことで大きな改善が期待できます。", priorities:["転記・入力","業務自動化","AI活用"], improvements:["入力フォームの一本化","ツール間の自動連携","AIによる入力内容の整形","集計・報告書の自動生成","エラーチェックの自動化"] },
      "P03-A": { patternId:"P03", type:"AI導入迷子型", stars:5, lead:"AIの具体的な使い道が見えていないため、身近で安全な業務から試すのが効果的です。", priorities:["AI導入","文章作成","情報整理"], improvements:["メール文章の作成支援","会議内容の要約","情報収集・整理への活用","社内向けAI活用例の作成","小さな業務での試験導入"] },
      "P03-B": { patternId:"P03", type:"AI導入迷子型", stars:5, lead:"現在負担になっている入力・転記業務からAIを試すと、効果を実感しやすい状態です。", priorities:["AI導入","転記・入力","定型業務"], improvements:["文章作成へのAI導入","入力内容の自動整形","転記前データの要約・分類","定型報告書の下書き作成","AI活用業務の選定"] },
      "P04-A": { patternId:"P04", type:"AI安全整備型", stars:4, lead:"安全面への不安が導入の障壁になっているため、ルール整備が最初の改善ポイントです。", priorities:["利用ルール","情報管理","試験導入"], improvements:["AI利用ルールの作成","入力禁止情報の明確化","利用可能ツールの選定","安全に試せる業務の選定","小規模な試験運用"] },
      "P05-A": { patternId:"P05", type:"AI属人化型", stars:4, lead:"AIを使える人にノウハウが偏っているため、使い方を共有資産に変える必要があります。", priorities:["AI標準化","ナレッジ共有","教育"], improvements:["業務別プロンプト集の作成","活用事例の共有","共通テンプレートの整備","AI利用ルールの統一","短時間の社内勉強会"] },
      "P05-B": { patternId:"P05", type:"AI属人化型", stars:4, lead:"便利な使い方が個人の中に留まっているため、再利用できる形で共有する余地があります。", priorities:["ナレッジ共有","AI標準化","マニュアル"], improvements:["活用事例一覧の作成","社内プロンプトライブラリの整備","業務別の使い方ガイド作成","成果の共有方法を統一","質問・相談窓口の設定"] },
      "P06-A": { patternId:"P06", type:"AI定着不足型", stars:5, lead:"AIは試せているものの、日常業務の手順に組み込まれていない状態です。", priorities:["AI定着","業務フロー","定型作業"], improvements:["AIを使う業務の固定化","業務手順へのAI工程追加","テンプレートの共通化","利用頻度の簡易記録","効果の定期確認"] },
      "P06-B": { patternId:"P06", type:"AI定着不足型", stars:5, lead:"AIを単発利用で終わらせず、負担の大きい転記業務へ組み込むと効果が出やすい状態です。", priorities:["AI定着","転記・入力","業務自動化"], improvements:["転記前後のAI整形","定型入力のテンプレート化","フォームとAIの連携","集計・報告作成へのAI組み込み","自動処理対象の選定"] },
      "P07-A": { patternId:"P07", type:"自動化ステップアップ型", stars:5, lead:"AI活用の次段階として、定型業務とツールをつないで作業自体を減らせる状態です。", priorities:["業務自動化","ツール連携","効果測定"], improvements:["フォームとスプレッドシートの自動連携","AIによるデータ整形","定型メールの自動作成","集計・報告書の自動生成","ツール間のデータ連携"] },
      "P07-B": { patternId:"P07", type:"自動化ステップアップ型", stars:5, lead:"転記よりも、AIを使った業務処理や判断補助の自動化が次の改善候補です。", priorities:["業務自動化","AI活用","運用設計"], improvements:["定型メールの自動生成","議事録からタスクの自動抽出","問い合わせ内容の自動分類","社内文書の自動下書き","自動化後の確認フロー整備"] },
      "P08-A": { patternId:"P08", type:"改善ポイント不明型", stars:3, lead:"明確な問題が少ないため、業務全体を整理して改善効果の高い場所を見つける段階です。", priorities:["業務整理","効果測定","優先順位"], improvements:["業務フローの可視化","作業時間の簡易計測","改善候補の棚卸し","効果指標の設定","次に改善する業務の優先順位付け"] },
      "P08-B": { patternId:"P08", type:"改善ポイント不明型", stars:4, lead:"AI利用は進んでいるため、次はチーム全体で安定して活用する運用整理が必要です。", priorities:["運用整理","チーム定着","効果測定"], improvements:["利用状況の整理","チーム共通ルールの見直し","活用業務の優先順位付け","成果が出た事例の共有","定着度を確認する簡易チェック"] }
    };

    const state = { step:0, answers:[], selectedIndex:null, activeQuestions:[], lead:null, leadId:null, result:null, scores:null };
    const diagnosisModal = document.getElementById("diagnosisModal");
    const resultModal = document.getElementById("resultModal");
    const questionContainer = document.getElementById("questionContainer");
    const progressText = document.getElementById("progressText");
    const progressFill = document.getElementById("progressFill");
    const resultContainer = document.getElementById("resultContainer");

    function openModal(modal){ modal.classList.add("is-open"); document.body.classList.add("modal-open"); requestAnimationFrame(()=>modal.classList.add("is-visible")); }
    function closeModal(modal){ modal.classList.remove("is-visible"); setTimeout(()=>{ modal.classList.remove("is-open"); if(!document.querySelector(".modal-backdrop.is-open")) document.body.classList.remove("modal-open"); },240); }
    function startDiagnosis(){ state.step=0; state.answers=[]; state.selectedIndex=null; state.lead=null; state.leadId=null; state.activeQuestions=[questions[0],questions[1],questions[2]]; renderQuestion(); openModal(diagnosisModal); }
    function currentQuestion(){ return state.activeQuestions[state.step]; }

    function renderQuestion(){
      const q=currentQuestion();
      state.selectedIndex=state.answers[state.step]?.optionIndex ?? null;
      progressText.textContent=`QUESTION ${state.step+1} / 4`;
      progressFill.style.width=`${((state.step+1)/4)*100}%`;
      questionContainer.innerHTML=`<div class="question-screen"><div class="question-kicker">QUESTION ${state.step+1}</div><h3 class="question-title">${q.title}</h3><p class="question-note">${q.note}</p><div class="option-list">${q.options.map((o,i)=>`<button class="option-card ${state.selectedIndex===i?"selected":""}" data-index="${i}" type="button"><span class="option-radio"></span><span class="option-main">${o.label}<span class="option-sub">${o.sub}</span></span></button>`).join("")}</div><div class="modal-actions"><button class="btn btn-secondary btn-back ${state.step>0?"is-visible":""}" type="button" id="backButton">戻る</button><button class="btn btn-primary btn-next" type="button" id="nextButton" ${state.selectedIndex===null?"disabled":""}>${state.step===3?"診断を完了する":"次へ"}</button></div></div>`;
      questionContainer.querySelectorAll(".option-card").forEach(btn=>btn.addEventListener("click",()=>{ state.selectedIndex=Number(btn.dataset.index); questionContainer.querySelectorAll(".option-card").forEach(el=>el.classList.remove("selected")); btn.classList.add("selected"); document.getElementById("nextButton").disabled=false; }));
      document.getElementById("backButton").addEventListener("click",()=>{ if(state.step>0){ state.step--; renderQuestion(); }});
      document.getElementById("nextButton").addEventListener("click",goNext);
    }

    function goNext(){
      if(state.selectedIndex===null)return;
      const q=currentQuestion(), option=q.options[state.selectedIndex];
      state.answers[state.step]={questionId:q.id,optionIndex:state.selectedIndex,option};
      if(q.id==="aiUsage") state.activeQuestions[3]=branchQuestions[option.value];
      if(state.step<3){ state.step++; renderQuestion(); } else { calculateDiagnosis(); closeModal(diagnosisModal); setTimeout(showLeadGate,270); }
    }

    function answerById(id){ return state.answers.find(a=>a?.questionId===id)?.option || {}; }
    function calculateScores(){ const scores={transfer:0,manual:0,ai:0}; state.answers.forEach(a=>Object.keys(scores).forEach(k=>scores[k]+=Number(a?.option?.scores?.[k]||0))); scores.total=scores.transfer+scores.manual+scores.ai; return scores; }
    function highTransfer(){ return ["high","mid"].includes(answerById("transfer").value); }

    function calculateDiagnosis(){
      const routine=answerById("routine").value, transfer=answerById("transfer").value, aiUsage=answerById("aiUsage").value, branch=answerById("aiBranch").value;
      let branchId="P08-A", reason="明確な改善負担が少ないため、業務整理を優先";
      if(aiUsage==="none" && branch==="security"){ branchId="P04-A"; reason="AI未利用で、情報管理・安全面への不安が最大の障壁"; }
      else if(aiUsage==="none" && branch==="unknown"){ branchId=highTransfer()?"P03-B":"P03-A"; reason=highTransfer()?"AIの用途が不明で、転記負担も高い":"AIの用途が分からず、身近な活用例が必要"; }
      else if(aiUsage==="none" && branch==="resource" && routine==="many" && transfer!=="high"){ branchId="P01-A"; reason="担当者不足に加え、転記以外の繰り返し作業が多い"; }
      else if(aiUsage==="partial" && branch==="skill_gap"){ branchId="P05-A"; reason="AI利用者によって使い方・スキルに差がある"; }
      else if(aiUsage==="partial" && branch==="not_shared"){ branchId="P05-B"; reason="便利なAI活用方法が社内で共有されていない"; }
      else if(aiUsage==="partial" && branch==="not_embedded"){ branchId=highTransfer()?"P06-B":"P06-A"; reason=highTransfer()?"AIが日常業務に定着せず、転記負担も高い":"AIを試しているが日常業務へ組み込めていない"; }
      else if(aiUsage==="active" && branch==="automation"){ branchId=highTransfer()?"P07-A":"P07-B"; reason=highTransfer()?"AI利用済みで、転記を含む定型業務の自動化余地が大きい":"AI利用済みで、業務処理の自動化へ進める段階"; }
      else if(aiUsage==="active" && branch==="adoption"){ branchId="P08-B"; reason="AIをチーム全体へ定着させる運用整理が必要"; }
      else if(aiUsage==="active" && branch==="measurement"){ branchId="P08-A"; reason="改善効果を可視化し、次の優先順位を整理する段階"; }
      else if(highTransfer()){ branchId=aiUsage==="none"?"P02-A":"P02-B"; reason="同じ情報の入力・転記が高頻度で発生している"; }
      else if(routine==="many"){ branchId="P01-A"; reason="転記以外の繰り返し手作業が多い"; }
      state.scores=calculateScores(); state.result={...patterns[branchId],branchId,reason};
    }

    function isValidCompanyUrl(value){ try{ const url=new URL(/^https?:\/\//i.test(value)?value:`https://${value}`); return Boolean(url.hostname&&url.hostname.includes(".")); }catch{return false;} }

    function showLeadGate(){
      const data=state.result;
      resultContainer.innerHTML=`<div class="lead-gate"><div class="lead-gate-head"><div class="lead-gate-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m5 12 4 4L19 6"/><circle cx="12" cy="12" r="9"/></svg></div><div class="result-badge">診断が完了しました</div><h2>${data.type}の傾向があります</h2><p class="lead-gate-lead">回答内容をもとに、御社で優先度の高い改善ポイントを整理しました。</p></div><div class="found-count"><span>あなたの会社では</span><strong>約5個の改善案</strong><span>が見つかりました。</span></div><div class="expectation-card"><div class="expectation-label">改善後の効果実感期待度</div><div class="expectation-stars">${"★".repeat(data.stars)}${"☆".repeat(5-data.stars)}</div></div><form class="lead-form" id="leadForm" novalidate><div class="form-field"><label for="companyName">会社名<span class="required-badge">必須</span></label><input id="companyName" type="text" autocomplete="organization" placeholder="例：株式会社〇〇" required><div class="field-error" id="companyNameError">会社名を入力してください。</div></div><div class="form-field"><label for="companyUrl">会社ホームページ<span class="required-badge">必須</span></label><input id="companyUrl" type="url" inputmode="url" placeholder="例：https://example.co.jp" required><div class="field-note">会社概要や事業内容を確認し、改善案を具体化するために使用します。</div><div class="field-error" id="companyUrlError">有効な会社ホームページURLを入力してください。</div></div><div class="form-field"><label for="contactName">ご担当者名<span class="required-badge">必須</span></label><input id="contactName" type="text" autocomplete="name" placeholder="例：田中 太郎" required><div class="field-error" id="contactNameError">ご担当者名を入力してください。</div></div><div class="form-field"><label for="phone">電話番号<span class="optional-badge">任意</span></label><input id="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="例：03-1234-5678"><div class="field-note">ご相談を希望される場合の連絡先として使用します。</div></div><button class="btn btn-primary btn-full btn-large" id="leadSubmit" type="submit">改善案を見る</button><div class="submit-status" id="submitStatus"></div></form><p class="privacy-note">入力内容は、診断結果の提供および業務改善のご案内に利用します。</p></div>`;
      document.getElementById("leadForm").addEventListener("submit",handleLeadSubmit); openModal(resultModal);
    }

    async function handleLeadSubmit(event){
      event.preventDefault();
      const nameInput=document.getElementById("companyName"), urlInput=document.getElementById("companyUrl"), contactInput=document.getElementById("contactName"), phoneInput=document.getElementById("phone"), name=nameInput.value.trim(), rawUrl=urlInput.value.trim(), contactName=contactInput.value.trim(), phone=phoneInput.value.trim();
      [nameInput,urlInput,contactInput,phoneInput].forEach(el=>el.classList.remove("is-error")); document.querySelectorAll(".field-error").forEach(el=>el.classList.remove("show"));
      let valid=true; if(!name){valid=false;nameInput.classList.add("is-error");document.getElementById("companyNameError").classList.add("show");} if(!rawUrl||!isValidCompanyUrl(rawUrl)){valid=false;urlInput.classList.add("is-error");document.getElementById("companyUrlError").classList.add("show");} if(!contactName){valid=false;contactInput.classList.add("is-error");document.getElementById("contactNameError").classList.add("show");} if(!valid)return;
      state.lead={companyName:name,companyUrl:/^https?:\/\//i.test(rawUrl)?rawUrl:`https://${rawUrl}`,contactName,phone};
      showAnalysisLoader();
      try{
        const response=await fetch(GAS_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(buildLeadPayload())});
        const data=await response.json(); if(!data.success) throw new Error(data.message||"保存に失敗しました。"); state.leadId=data.leadId; await runAnalysisAnimation(); showResult();
      }catch(error){ console.error(error); showLeadGate(); document.getElementById("submitStatus").textContent="通信に失敗しました。時間をおいてもう一度お試しください。"; document.getElementById("companyName").value=state.lead.companyName; document.getElementById("companyUrl").value=state.lead.companyUrl; document.getElementById("contactName").value=state.lead.contactName||""; document.getElementById("phone").value=state.lead.phone||""; }
    }

    function buildLeadPayload(){
      const q1=state.answers[0]?.option?.label||"",q2=state.answers[1]?.option?.label||"",q3=state.answers[2]?.option?.label||"",q4=state.answers[3]?.option?.label||"";
      return {action:"createLead",companyName:state.lead.companyName,companyUrl:state.lead.companyUrl,contactName:state.lead.contactName,phone:state.lead.phone,patternId:state.result.patternId,diagnosisType:state.result.type,branchId:state.result.branchId,branchReason:state.result.reason,effectRating:`${"★".repeat(state.result.stars)}${"☆".repeat(5-state.result.stars)}`,aiUsage:answerById("aiUsage").value||"",branchAnswer:q4,scores:state.scores,answers:{q1,q2,q3,q4},priorities:state.result.priorities,improvements:state.result.improvements};
    }

    function showAnalysisLoader(){
      resultContainer.innerHTML=`<div class="analysis-loader"><div class="analysis-orbit"><div class="analysis-orbit-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1"><path d="M4 14l5-5 4 4 7-7"/><path d="M15 6h5v5"/></svg></div></div><h2>診断結果を作成しています</h2><p>回答内容と会社情報をもとに、改善効果の高いポイントを整理しています。</p><div class="analysis-steps"><div class="analysis-step active" id="analysisStep1"><span class="analysis-step-dot">1</span>会社情報を安全に保存しています</div><div class="analysis-step" id="analysisStep2"><span class="analysis-step-dot">2</span>回答傾向を分析しています</div><div class="analysis-step" id="analysisStep3"><span class="analysis-step-dot">3</span>改善案を選定しています</div></div></div>`;
    }
    const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
    async function runAnalysisAnimation(){ const s1=document.getElementById("analysisStep1"),s2=document.getElementById("analysisStep2"),s3=document.getElementById("analysisStep3"); await sleep(450); s1?.classList.replace("active","done"); s1?.querySelector(".analysis-step-dot")&&(s1.querySelector(".analysis-step-dot").textContent="✓"); s2?.classList.add("active"); await sleep(650); s2?.classList.replace("active","done"); s2?.querySelector(".analysis-step-dot")&&(s2.querySelector(".analysis-step-dot").textContent="✓"); s3?.classList.add("active"); await sleep(650); s3?.classList.replace("active","done"); s3?.querySelector(".analysis-step-dot")&&(s3.querySelector(".analysis-step-dot").textContent="✓"); await sleep(300); }

    function showResult(){
      const d=state.result, stars="★".repeat(d.stars)+"☆".repeat(5-d.stars), scoreEntries=[["転記・入力",state.scores.transfer],["手作業",state.scores.manual],["AI活用",state.scores.ai]], max=Math.max(...scoreEntries.map(x=>x[1]),1);
      resultContainer.innerHTML=`<div class="result-hero"><div class="result-badge">${escapeHtml(state.lead.companyName)}の診断結果</div><div class="result-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 14l5-5 4 4 7-7"/><path d="M15 6h5v5"/></svg></div><h2 class="result-title" id="resultTitle">${d.type}</h2><p class="result-lead">${d.lead}</p></div><div class="expectation-card"><div class="expectation-label">改善後の効果実感期待度</div><div class="expectation-stars">${stars}</div><div class="expectation-text">回答内容に基づく、現時点での改善期待度です。</div></div><div class="result-panel" style="margin-top:18px;"><h3>御社で検討できる改善案</h3><div class="improvement-list">${d.improvements.map((item,i)=>`<div class="improvement-item"><div class="improvement-number">${String(i+1).padStart(2,"0")}</div><div><h4>${item}</h4><p>${improvementDescription(item)}</p></div></div>`).join("")}</div></div><div class="result-panel" style="margin-top:14px;"><h3>回答傾向</h3><div class="score-bars">${scoreEntries.map(([label,value])=>`<div class="score-row"><span>${label}</span><div class="score-track"><div class="score-fill" style="width:${Math.max(8,value/max*100)}%"></div></div><strong>${value}</strong></div>`).join("")}</div></div><div class="free-offer"><strong>この中から1つ、無料で導入できます。</strong><span>御社の業務内容を確認し、効果が出やすい改善案を一緒に選定します。</span></div><div class="result-cta"><p>30分の無料相談で、御社に合う改善方法を具体的に整理します。</p><a class="btn btn-primary btn-full" href="${TIMEREX_URL}" target="_blank" rel="noopener" id="timerexButton">TimeRexで無料相談を予約する</a><div class="result-subactions"><button class="text-button" type="button" id="copyResult">診断結果をコピー</button></div></div>`;
      document.getElementById("copyResult").addEventListener("click",copyResult); document.getElementById("timerexButton").addEventListener("click",recordTimerexClick);
    }

    function improvementDescription(item){ const map={"入力フォームの一本化":"複数の入力先を整理し、一度の入力で情報を活用できる状態を目指します。","Excel集計の自動化":"日次・週次・月次の集計作業を自動で更新できる形へ整えます。","AI利用ルールの作成":"安全に使うための入力基準や禁止事項を分かりやすく整理します。","業務フローの可視化":"業務の流れと停滞ポイントを見える状態にします。","定型メールの自動生成":"用途別の文章作成を短時間で行える仕組みを整えます。"}; return map[item]||"現在の業務に合わせて、無理なく始められる形へ具体化します。"; }

    function recordTimerexClick(){ if(!state.leadId)return; fetch(GAS_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action:"timerexClick",leadId:state.leadId}),keepalive:true}).catch(console.error); }
    async function copyResult(){ const d=state.result,text=`【隣のカイゼンくん 無料業務改善診断】\n会社名：${state.lead?.companyName||""}\n会社HP：${state.lead?.companyUrl||""}\n診断タイプ：${d.type}\n改善後の効果実感期待度：${"★".repeat(d.stars)}${"☆".repeat(5-d.stars)}\n\n改善案\n・${d.improvements.join("\n・")}`; try{await navigator.clipboard.writeText(text);showToast("結果をコピーしました");}catch{showToast("コピーできませんでした");} }
    function escapeHtml(value){ return String(value).replace(/[&<>'"]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[ch])); }
    function showToast(message){ const toast=document.getElementById("toast");toast.textContent=message;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),2200); }

    document.querySelectorAll(".js-open-diagnosis").forEach(btn=>btn.addEventListener("click",startDiagnosis));
    document.querySelectorAll(".js-close-modal").forEach(btn=>btn.addEventListener("click",()=>closeModal(diagnosisModal)));
    document.querySelectorAll(".js-close-result").forEach(btn=>btn.addEventListener("click",()=>closeModal(resultModal)));
    [diagnosisModal,resultModal].forEach(modal=>modal.addEventListener("click",e=>{if(e.target===modal)closeModal(modal);}));
    document.addEventListener("keydown",e=>{if(e.key==="Escape"){if(resultModal.classList.contains("is-open"))closeModal(resultModal);else if(diagnosisModal.classList.contains("is-open"))closeModal(diagnosisModal);}});
    const header=document.getElementById("siteHeader"); window.addEventListener("scroll",()=>header.classList.toggle("scrolled",window.scrollY>18),{passive:true});
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("visible");observer.unobserve(entry.target);}}),{threshold:.14}); document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));
