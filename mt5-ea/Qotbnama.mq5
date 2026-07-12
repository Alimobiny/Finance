//+------------------------------------------------------------------+
//|                                                     Qotbnama.mq5 |
//|   ژورنالِ خودکارِ قطب‌نما:                                        |
//|   معاملاتِ بسته‌شده را به یک GitHub Gistِ خصوصی می‌فرستد تا اپِ    |
//|   قطب‌نما (روی GitHub Pages) خودکار بخواند.                        |
//|   چرا گیت‌هاب؟ رایگان است، از ایران باز است، و دادهٔ معاملات       |
//|   در Gistِ خصوصی می‌ماند (نه Google که از ایران بلاک است).         |
//+------------------------------------------------------------------+
#property copyright "Qotbnama"
#property version   "1.00"
#property strict
#property description "معاملاتِ بسته‌شده را به GitHub Gistِ خصوصی می‌فرستد (برای اپ قطب‌نما)."

//--- ورودی‌ها -------------------------------------------------------
input string InpToken    = "";                  // توکنِ گیت‌هاب (scope فقط gist)
input string InpGistId   = "";                  // شناسهٔ Gist (از URL گیست)
input string InpFile     = "qotbnama-ea.json";  // نامِ فایل در Gist
input int    InpDays     = 90;                   // چند روزِ اخیر ارسال شود
input int    InpTimerSec = 60;                   // فاصلهٔ همگام‌سازی (ثانیه)

//--- کشِ استاپ/حدسودِ اولیه per position ----------------------------
// گزارشِ بسته «آخرین» استاپ را دارد نه اولیه؛ پس استاپِ لحظهٔ ورود را این‌جا
// نگه می‌داریم تا ریسکِ واقعیِ هر معامله دقیق (و ترِیل‌پروف) بماند.
ulong  g_pid[];
double g_sl[];
double g_tp[];
const string CACHE_FILE = "qotbnama_ea_cache.csv";

//+------------------------------------------------------------------+
int OnInit()
{
   LoadCache();
   EventSetTimer(MathMax(10, InpTimerSec));
   if(InpToken=="" || InpGistId=="")
      Print("Qotbnama: توکن یا شناسهٔ Gist خالی است — در ورودی‌های EA پرشان کن.");
   Print("Qotbnama: یادت باشد https://api.github.com را در Tools→Options→Expert Advisors→WebRequest اضافه کنی.");
   SyncToGist(); // یک همگام‌سازیِ اولیه
   return(INIT_SUCCEEDED);
}

void OnDeinit(const int reason){ EventKillTimer(); }

void OnTimer(){ SyncToGist(); }

//+------------------------------------------------------------------+
//| روی هر تراکنش: استاپِ اولیه را در لحظهٔ ورود ثبت کن؛ روی بسته‌شدن  |
//| همگام‌سازی کن.                                                     |
//+------------------------------------------------------------------+
void OnTradeTransaction(const MqlTradeTransaction &trans,
                        const MqlTradeRequest &request,
                        const MqlTradeResult &result)
{
   if(trans.type != TRADE_TRANSACTION_DEAL_ADD) return;
   if(!HistoryDealSelect(trans.deal)) return;

   long  entry = HistoryDealGetInteger(trans.deal, DEAL_ENTRY);
   ulong pid   = (ulong)HistoryDealGetInteger(trans.deal, DEAL_POSITION_ID);

   if(entry == DEAL_ENTRY_IN)
   {
      double sl = 0, tp = 0;
      if(PositionSelectByTicket(pid))
      {
         sl = PositionGetDouble(POSITION_SL);
         tp = PositionGetDouble(POSITION_TP);
      }
      RecordInitial(pid, sl, tp);
      SaveCache();
   }
   else if(entry == DEAL_ENTRY_OUT || entry == DEAL_ENTRY_OUT_BY)
   {
      SyncToGist(); // پوزیشنی بسته شد → همین حالا بفرست
   }
}

//+------------------------------------------------------------------+
//| کشِ استاپ/حدسودِ اولیه                                            |
//+------------------------------------------------------------------+
void RecordInitial(ulong pid, double sl, double tp)
{
   for(int i=0;i<ArraySize(g_pid);i++)
      if(g_pid[i]==pid){ g_sl[i]=sl; g_tp[i]=tp; return; }
   int n=ArraySize(g_pid);
   ArrayResize(g_pid,n+1); ArrayResize(g_sl,n+1); ArrayResize(g_tp,n+1);
   g_pid[n]=pid; g_sl[n]=sl; g_tp[n]=tp;
}
double GetInitSL(ulong pid){ for(int i=0;i<ArraySize(g_pid);i++) if(g_pid[i]==pid) return(g_sl[i]); return(0); }
double GetInitTP(ulong pid){ for(int i=0;i<ArraySize(g_pid);i++) if(g_pid[i]==pid) return(g_tp[i]); return(0); }

void SaveCache()
{
   int h=FileOpen(CACHE_FILE, FILE_WRITE|FILE_CSV|FILE_ANSI, ',');
   if(h==INVALID_HANDLE) return;
   for(int i=0;i<ArraySize(g_pid);i++)
      FileWrite(h,(string)g_pid[i], DoubleToString(g_sl[i],8), DoubleToString(g_tp[i],8));
   FileClose(h);
}
void LoadCache()
{
   ArrayResize(g_pid,0); ArrayResize(g_sl,0); ArrayResize(g_tp,0);
   if(!FileIsExist(CACHE_FILE)) return;
   int h=FileOpen(CACHE_FILE, FILE_READ|FILE_CSV|FILE_ANSI, ',');
   if(h==INVALID_HANDLE) return;
   while(!FileIsEnding(h))
   {
      ulong  pid=(ulong)StringToInteger(FileReadString(h));
      double sl =StringToDouble(FileReadString(h));
      double tp =StringToDouble(FileReadString(h));
      if(pid>0) RecordInitial(pid,sl,tp);
   }
   FileClose(h);
}

//+------------------------------------------------------------------+
//| ریسکِ دلاریِ واقعی = فاصلهٔ استاپ (به تیک) × ارزشِ تیک × حجم       |
//+------------------------------------------------------------------+
double RiskUsd(string sym,double open,double sl,double lot)
{
   if(sl<=0 || open<=0 || lot<=0) return(0);
   double ts=SymbolInfoDouble(sym,SYMBOL_TRADE_TICK_SIZE);
   double tv=SymbolInfoDouble(sym,SYMBOL_TRADE_TICK_VALUE);
   if(ts<=0) return(0);
   return( MathAbs(open-sl)/ts * tv * lot );
}

//+------------------------------------------------------------------+
//| ساختِ آرایهٔ JSON از معاملاتِ بسته‌شدهٔ InpDays روزِ اخیر           |
//+------------------------------------------------------------------+
string BuildTradesJson()
{
   datetime from = TimeCurrent() - (datetime)InpDays*86400;
   if(!HistorySelect(from, TimeCurrent())) return("[]");

   ulong    pid[];   string sym[];   long typ[];
   double   lot[], open[], close_[], prof[], comm[], swp[];
   datetime ot[], ct[];
   bool     hasIn[], hasOut[];

   int total = HistoryDealsTotal();
   for(int i=0;i<total;i++)
   {
      ulong  ticket = HistoryDealGetTicket(i);
      if(ticket==0) continue;
      long   dealType = HistoryDealGetInteger(ticket, DEAL_TYPE);
      if(dealType!=DEAL_TYPE_BUY && dealType!=DEAL_TYPE_SELL) continue; // فقط دیل‌های خرید/فروش
      ulong  p   = (ulong)HistoryDealGetInteger(ticket, DEAL_POSITION_ID);
      long   ent = HistoryDealGetInteger(ticket, DEAL_ENTRY);
      int idx = -1;
      for(int k=0;k<ArraySize(pid);k++) if(pid[k]==p){ idx=k; break; }
      if(idx<0)
      {
         idx=ArraySize(pid);
         ArrayResize(pid,idx+1);   ArrayResize(sym,idx+1);   ArrayResize(typ,idx+1);
         ArrayResize(lot,idx+1);   ArrayResize(open,idx+1);  ArrayResize(close_,idx+1);
         ArrayResize(prof,idx+1);  ArrayResize(comm,idx+1);  ArrayResize(swp,idx+1);
         ArrayResize(ot,idx+1);    ArrayResize(ct,idx+1);
         ArrayResize(hasIn,idx+1); ArrayResize(hasOut,idx+1);
         pid[idx]=p; sym[idx]=""; typ[idx]=0; lot[idx]=0; open[idx]=0; close_[idx]=0;
         prof[idx]=0; comm[idx]=0; swp[idx]=0; ot[idx]=0; ct[idx]=0; hasIn[idx]=false; hasOut[idx]=false;
      }
      // جمعِ کمیسیون/سواپ/سود از همهٔ دیل‌های پوزیشن
      comm[idx]+=HistoryDealGetDouble(ticket, DEAL_COMMISSION);
      swp[idx] +=HistoryDealGetDouble(ticket, DEAL_SWAP);
      prof[idx]+=HistoryDealGetDouble(ticket, DEAL_PROFIT);

      if(ent==DEAL_ENTRY_IN)
      {
         hasIn[idx]=true;
         sym[idx] =HistoryDealGetString(ticket, DEAL_SYMBOL);
         typ[idx] =(dealType==DEAL_TYPE_BUY)?0:1; // جهتِ پوزیشن = جهتِ دیلِ ورود
         lot[idx] =HistoryDealGetDouble(ticket, DEAL_VOLUME);
         open[idx]=HistoryDealGetDouble(ticket, DEAL_PRICE);
         ot[idx]  =(datetime)HistoryDealGetInteger(ticket, DEAL_TIME);
      }
      else if(ent==DEAL_ENTRY_OUT || ent==DEAL_ENTRY_OUT_BY)
      {
         hasOut[idx]=true;
         close_[idx]=HistoryDealGetDouble(ticket, DEAL_PRICE);
         ct[idx]    =(datetime)HistoryDealGetInteger(ticket, DEAL_TIME);
      }
   }

   string json="[";
   int first=true;
   for(int k=0;k<ArraySize(pid);k++)
   {
      if(!hasIn[k] || !hasOut[k]) continue; // فقط پوزیشن‌های کاملِ بسته‌شده
      double sl = GetInitSL(pid[k]);
      double tp = GetInitTP(pid[k]);
      double net = prof[k]+comm[k]+swp[k]; // سودِ خالص
      double risk= RiskUsd(sym[k], open[k], sl, lot[k]);

      if(!first) json+=",";
      first=false;
      json+="{";
      json+="\"ticket\":\""+(string)pid[k]+"\",";
      json+="\"symbol\":\""+sym[k]+"\",";
      json+="\"type\":"+(string)typ[k]+",";
      json+="\"lot\":"+DoubleToString(lot[k],2)+",";
      json+="\"openTime\":\""+TimeToString(ot[k], TIME_DATE|TIME_SECONDS)+"\",";
      json+="\"openPrice\":"+DoubleToString(open[k],5)+",";
      json+="\"initialSL\":"+DoubleToString(sl,5)+",";
      json+="\"tp\":"+DoubleToString(tp,5)+",";
      json+="\"closeTime\":\""+TimeToString(ct[k], TIME_DATE|TIME_SECONDS)+"\",";
      json+="\"closePrice\":"+DoubleToString(close_[k],5)+",";
      json+="\"profit\":"+DoubleToString(net,2)+",";
      json+="\"commission\":"+DoubleToString(comm[k],2)+",";
      json+="\"swap\":"+DoubleToString(swp[k],2)+",";
      json+="\"riskUsd\":"+DoubleToString(risk,2);
      json+="}";
   }
   json+="]";
   return(json);
}

//+------------------------------------------------------------------+
//| فرستادنِ JSON به Gist با PATCH (WebRequest)                        |
//+------------------------------------------------------------------+
string JsonEscape(string s)
{
   StringReplace(s,"\\","\\\\");
   StringReplace(s,"\"","\\\"");
   StringReplace(s,"\r","\\r");
   StringReplace(s,"\n","\\n");
   StringReplace(s,"\t","\\t");
   return(s);
}

void SyncToGist()
{
   if(InpToken=="" || InpGistId=="") return;
   string content = BuildTradesJson();
   string body = "{\"files\":{\""+InpFile+"\":{\"content\":\""+JsonEscape(content)+"\"}}}";

   string url = "https://api.github.com/gists/"+InpGistId;
   string headers = "Authorization: token "+InpToken+"\r\n"
                    "Content-Type: application/json\r\n"
                    "User-Agent: Qotbnama-EA\r\n"
                    "Accept: application/vnd.github+json\r\n";

   uchar data[]; StringToCharArray(body, data, 0, WHOLE_ARRAY, CP_UTF8);
   int sz=ArraySize(data); if(sz>0 && data[sz-1]==0) ArrayResize(data, sz-1); // حذفِ nullِ انتها

   uchar  result[]; string rheaders;
   ResetLastError();
   int code = WebRequest("PATCH", url, headers, 8000, data, result, rheaders);
   if(code==-1)
      Print("Qotbnama WebRequest خطا: ",GetLastError(),
            " — آیا https://api.github.com در لیستِ WebRequest اضافه شده؟");
   else if(code<200 || code>=300)
      Print("Qotbnama Gist پاسخِ HTTP ", code, ": ", CharArrayToString(result,0,WHOLE_ARRAY,CP_UTF8));
   else
      Print("Qotbnama: ژورنال روی Gist به‌روزرسانی شد (HTTP ",code,").");
}
//+------------------------------------------------------------------+
