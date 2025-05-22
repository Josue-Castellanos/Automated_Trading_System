import React, { useRef, useState, useEffect } from 'react';
import { useChart } from './useChart';
import { WidgetFrame } from '../../shared/WidgetFrame';
import { DrawingToolbar } from '../../toolbar/DrawingToolbar';
import '../../toolbar/DrawingToolset.css';
import { 
    Box, 
    TextField, 
    Autocomplete, 
    Typography, 
    Button, 
    Menu, 
    MenuItem, 
    Dialog
    } from '@mui/material';
import { SketchPicker } from 'react-color';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import './ChartWidget.css';

const SYMBOL_OPTIONS = [
  {
      "symbol": "A",
      "name": "Agilent Technologies, Inc."
  },
  {
      "symbol": "AA",
      "name": "Alcoa Inc."
  },
  {
      "symbol": "AA^",
      "name": "Alcoa Inc."
  },
  {
      "symbol": "AAC",
      "name": "Australia Acquisition Corp."
  },
  {
      "symbol": "AACC",
      "name": "Asset Acceptance Capital Corp."
  },
  {
      "symbol": "AACOU",
      "name": "Australia Acquisition Corp."
  },
  {
      "symbol": "AACOW",
      "name": "Australia Acquisition Corp."
  },
  {
      "symbol": "AAIT",
      "name": "iShares Trust iShares MSCI All Country Asia Information Techno"
  },
  {
      "symbol": "AAME",
      "name": "Atlantic American Corporation"
  },
  {
      "symbol": "AAN",
      "name": "Aaron&#39;s,  Inc."
  },
  {
      "symbol": "AAON",
      "name": "AAON, Inc."
  },
  {
      "symbol": "AAP",
      "name": "Advance Auto Parts Inc"
  },
  {
      "symbol": "AAPL",
      "name": "Apple Inc."
  },
  {
      "symbol": "AAT",
      "name": "American Assets Trust, Inc."
  },
  {
      "symbol": "AAU",
      "name": "Almaden Minerals, Ltd."
  },
  {
      "symbol": "AAV",
      "name": "Advantage Oil & Gas Ltd"
  },
  {
      "symbol": "AAWW",
      "name": "Atlas Air Worldwide Holdings"
  },
  {
      "symbol": "AAXJ",
      "name": "iShares MSCI All Country Asia ex Japan Index Fund"
  },
  {
      "symbol": "AAZ^K",
      "name": "SiM Internal Test 1"
  },
  {
      "symbol": "AB",
      "name": "Alliance Capital Management Holding L.P."
  },
  {
      "symbol": "ABAX",
      "name": "ABAXIS, Inc."
  },
  {
      "symbol": "ABB",
      "name": "ABB Ltd"
  },
  {
      "symbol": "ABC",
      "name": "AmerisourceBergen Corporation (Holding Co)"
  },
  {
      "symbol": "ABCB",
      "name": "Ameris Bancorp"
  },
  {
      "symbol": "ABCD",
      "name": "Cambium Learning Group, Inc."
  },
  {
      "symbol": "ABCO",
      "name": "The Advisory Board Company"
  },
  {
      "symbol": "ABFS",
      "name": "Arkansas Best Corporation"
  },
  {
      "symbol": "ABG",
      "name": "Asbury Automotive Group Inc"
  },
  {
      "symbol": "ABH",
      "name": "AbitibiBowater Inc."
  },
  {
      "symbol": "ABIO",
      "name": "ARCA biopharma, Inc."
  },
  {
      "symbol": "ABM",
      "name": "ABM Industries Incorporated"
  },
  {
      "symbol": "ABMD",
      "name": "ABIOMED, Inc."
  },
  {
      "symbol": "ABR",
      "name": "Arbor Realty Trust"
  },
  {
      "symbol": "ABT",
      "name": "Abbott Laboratories"
  },
  {
      "symbol": "ABTL",
      "name": "Autobytel Inc."
  },
  {
      "symbol": "ABV",
      "name": "Companhia de Bebidas das Americas - AmBev"
  },
  {
      "symbol": "ABV/C",
      "name": "Companhia de Bebidas das Americas - AmBev"
  },
  {
      "symbol": "ABVA",
      "name": "Alliance Bankshares Corporation"
  },
  {
      "symbol": "ABVT",
      "name": "Abovenet Inc"
  },
  {
      "symbol": "ABW^A",
      "name": "Associated Banc-Corp"
  },
  {
      "symbol": "ABW^B",
      "name": "Associated Banc-Corp"
  },
  {
      "symbol": "ABX",
      "name": "Barrick Gold Corporation"
  },
  {
      "symbol": "ACAD",
      "name": "ACADIA Pharmaceuticals Inc."
  },
  {
      "symbol": "ACAS",
      "name": "American Capital, Ltd."
  },
  {
      "symbol": "ACAT",
      "name": "Arctic Cat Inc."
  },
  {
      "symbol": "ACC",
      "name": "American Campus Communities Inc"
  },
  {
      "symbol": "ACCL",
      "name": "Accelrys, Inc."
  },
  {
      "symbol": "ACCO",
      "name": "Acco Brands Corporation"
  },
  {
      "symbol": "ACE",
      "name": "Ace Limited"
  },
  {
      "symbol": "ACET",
      "name": "Aceto Corporation"
  },
  {
      "symbol": "ACFC",
      "name": "Atlantic Coast Federal Corporation"
  },
  {
      "symbol": "ACFN",
      "name": "Acorn Energy, Inc."
  },
  {
      "symbol": "ACG",
      "name": "ALLIANCEBERNSTEIN INCOME FUND INC"
  },
  {
      "symbol": "ACGL",
      "name": "Arch Capital Group Ltd."
  },
  {
      "symbol": "ACH",
      "name": "Aluminum Corporation of China Ltd"
  },
  {
      "symbol": "ACHC",
      "name": "Acadia Healthcare Company, Inc."
  },
  {
      "symbol": "ACHN",
      "name": "Achillion Pharmaceuticals, Inc."
  },
  {
      "symbol": "ACI",
      "name": "Arch Coal, Inc."
  },
  {
      "symbol": "ACIW",
      "name": "ACI Worldwide, Inc."
  },
  {
      "symbol": "ACLS",
      "name": "Axcelis Technologies, Inc."
  },
  {
      "symbol": "ACM",
      "name": "Aecom Technology Corporation"
  },
  {
      "symbol": "ACN",
      "name": "Accenture plc."
  },
  {
      "symbol": "ACNB",
      "name": "ACNB Corporation"
  },
  {
      "symbol": "ACO",
      "name": "Amcol International Corporation"
  },
  {
      "symbol": "ACOM          ",
      "name": "Ancestry.com, Inc."
  },
  {
      "symbol": "ACOR",
      "name": "Acorda Therapeutics, Inc."
  },
  {
      "symbol": "ACP",
      "name": "Avenue Income Credit Strategies Fund"
  },
  {
      "symbol": "ACPW",
      "name": "Active Power, Inc."
  },
  {
      "symbol": "ACRE",
      "name": "Ares Commercial Real Estate Corporation"
  },
  {
      "symbol": "ACRX",
      "name": "AcelRx Pharmaceuticals, Inc."
  },
  {
      "symbol": "ACTG",
      "name": "Acacia Research Corporation"
  },
  {
      "symbol": "ACTS",
      "name": "Actions Semiconductor Co., Ltd."
  },
  {
      "symbol": "ACTV",
      "name": "The Active Network, Inc."
  },
  {
      "symbol": "ACU",
      "name": "Acme United Corporation."
  },
  {
      "symbol": "ACUR",
      "name": "Acura Pharmaceuticals, Inc."
  },
  {
      "symbol": "ACW",
      "name": "Accuride Corporation New"
  },
  {
      "symbol": "ACWI",
      "name": "iShares MSCI ACWI Index Fund"
  },
  {
      "symbol": "ACWX",
      "name": "iShares MSCI ACWI ex US Index Fund"
  },
  {
      "symbol": "ACXM",
      "name": "Acxiom Corporation"
  },
  {
      "symbol": "ACY",
      "name": "AeroCentury Corp."
  },
  {
      "symbol": "ADAT",
      "name": "Authentidate Holding Corp."
  },
  {
      "symbol": "ADBE",
      "name": "Adobe Systems Incorporated"
  },
  {
      "symbol": "ADC",
      "name": "Agree Realty Corporation"
  },
  {
      "symbol": "ADEP",
      "name": "Adept Technology, Inc."
  },
  {
      "symbol": "ADES",
      "name": "ADA-ES, Inc."
  },
  {
      "symbol": "ADGE",
      "name": "American DG Energy Inc."
  },
  {
      "symbol": "ADGF",
      "name": "Adams Golf, Inc."
  },
  {
      "symbol": "ADI",
      "name": "Analog Devices, Inc."
  },
  {
      "symbol": "ADK",
      "name": "Adcare Health Systems Inc"
  },
  {
      "symbol": "ADM",
      "name": "Archer-Daniels-Midland Company"
  },
  {
      "symbol": "ADP",
      "name": "Automatic Data Processing, Inc."
  },
  {
      "symbol": "ADRA",
      "name": "BLDRS Asia 50 ADR Index Fund"
  },
  {
      "symbol": "ADRD",
      "name": "BLDRS Developed Markets 100 ADR Index Fund"
  },
  {
      "symbol": "ADRE",
      "name": "BLDRS Emerging Markets 50 ADR Index Fund"
  },
  {
      "symbol": "ADRU",
      "name": "BLDRS Europe 100 ADR Index Fund"
  },
  {
      "symbol": "ADS",
      "name": "Alliance Data Systems Corporation"
  },
  {
      "symbol": "ADSK",
      "name": "Autodesk, Inc."
  },
  {
      "symbol": "ADTN",
      "name": "ADTRAN, Inc."
  },
  {
      "symbol": "ADUS",
      "name": "Addus HomeCare Corporation"
  },
  {
      "symbol": "ADVS",
      "name": "Advent Software, Inc."
  },
  {
      "symbol": "ADX",
      "name": "Adams Express Company (The)"
  },
  {
      "symbol": "ADY",
      "name": "Feihe International, Inc."
  },
  {
      "symbol": "AE",
      "name": "Adams Resources & Energy, Inc."
  },
  {
      "symbol": "AEB",
      "name": "Aegon NV"
  },
  {
      "symbol": "AEC",
      "name": "Associated Estates Realty Corporation"
  },
  {
      "symbol": "AED",
      "name": "Aegon NV"
  },
  {
      "symbol": "AEE",
      "name": "Ameren Corporation"
  },
  {
      "symbol": "AEF",
      "name": "Aegon NV"
  },
  {
      "symbol": "AEG",
      "name": "Aegon NV"
  },
  {
      "symbol": "AEGN",
      "name": "Aegion Corp"
  },
  {
      "symbol": "AEGR",
      "name": "Aegerion Pharmaceuticals, Inc."
  },
  {
      "symbol": "AEH",
      "name": "Aegon NV"
  },
  {
      "symbol": "AEHR",
      "name": "Aehr Test Systems"
  },
  {
      "symbol": "AEIS",
      "name": "Advanced Energy Industries, Inc."
  },
  {
      "symbol": "AEK",
      "name": "Aegon NV"
  },
  {
      "symbol": "AEL",
      "name": "American Equity Investment Life Holding Company"
  },
  {
      "symbol": "AEM",
      "name": "Agnico-Eagle Mines Limited"
  },
  {
      "symbol": "AEO",
      "name": "American Eagle Outfitters, Inc."
  },
  {
      "symbol": "AEP",
      "name": "American Electric Power Company, Inc."
  },
  {
      "symbol": "AEP^A",
      "name": "American Electric Power Company, Inc."
  },
  {
      "symbol": "AEPI",
      "name": "AEP Industries Inc."
  },
  {
      "symbol": "AER",
      "name": "Aercap Holdings N.V."
  },
  {
      "symbol": "AERL",
      "name": "Asia Entertainment & Resources Ltd"
  },
  {
      "symbol": "AES",
      "name": "The AES Corporation"
  },
  {
      "symbol": "AES^C",
      "name": "The AES Corporation"
  },
  {
      "symbol": "AET",
      "name": "Aetna Inc."
  },
  {
      "symbol": "AETI",
      "name": "American Electric Technologies, Inc."
  },
  {
      "symbol": "AEV",
      "name": "Aegon NV"
  },
  {
      "symbol": "AEY",
      "name": "ADDvantage Technologies Group, Inc."
  },
  {
      "symbol": "AEZS",
      "name": "AEterna Zentaris Inc."
  },
  {
      "symbol": "AF",
      "name": "Astoria Financial Corporation"
  },
  {
      "symbol": "AFAM",
      "name": "Almost Family Inc"
  },
  {
      "symbol": "AFB",
      "name": "Alliance National Municipal Income Fund Inc"
  },
  {
      "symbol": "AFC",
      "name": "Allied Capital Corporation"
  },
  {
      "symbol": "AFCB",
      "name": "Athens Bancshares Corporation"
  },
  {
      "symbol": "AFCE",
      "name": "AFC Enterprises, Inc."
  },
  {
      "symbol": "AFE",
      "name": "American Financial Group, Inc."
  },
  {
      "symbol": "AFF",
      "name": "American International Group, Inc."
  },
  {
      "symbol": "AFFM",
      "name": "Affirmative Insurance Holdings, Inc."
  },
  {
      "symbol": "AFFX",
      "name": "Affymetrix, Inc."
  },
  {
      "symbol": "AFFY",
      "name": "Affymax, Inc."
  },
  {
      "symbol": "AFG",
      "name": "American Financial Group, Inc."
  },
  {
      "symbol": "AFL",
      "name": "Aflac Incorporated"
  },
  {
      "symbol": "AFOP",
      "name": "Alliance Fiber Optic Products, Inc."
  },
  {
      "symbol": "AFQ",
      "name": "American Financial Group, Inc."
  },
  {
      "symbol": "AFSI",
      "name": "AmTrust Financial Services, Inc."
  },
  {
      "symbol": "AFT",
      "name": "Apollo Senior Floating Rate Fund Inc."
  },
  {
      "symbol": "AG",
      "name": "First Majestic Silver Corp."
  },
  {
      "symbol": "AGC",
      "name": "Advent Claymore Convertible Securities and Income Fund II"
  },
  {
      "symbol": "AGCO",
      "name": "AGCO Corporation"
  },
  {
      "symbol": "AGD",
      "name": "Alpine Global Dynamic Dividend Fund"
  },
  {
      "symbol": "AGEN",
      "name": "Agenus Inc."
  },
  {
      "symbol": "AGII",
      "name": "Argo Group International Holdings, Ltd."
  },
  {
      "symbol": "AGM",
      "name": "Federal Agricultural Mortgage Corporation"
  },
  {
      "symbol": "AGM/A",
      "name": "Federal Agricultural Mortgage Corporation"
  },
  {
      "symbol": "AGN",
      "name": "Allergan, Inc."
  },
  {
      "symbol": "AGNC",
      "name": "American Capital Agency Corp."
  },
  {
      "symbol": "AGNCP",
      "name": "American Capital Agency Corp."
  },
  {
      "symbol": "AGO",
      "name": "Assured Guaranty Ltd."
  },
  {
      "symbol": "AGO^B",
      "name": "Assured Guaranty Ltd."
  },
  {
      "symbol": "AGO^E",
      "name": "Assured Guaranty Ltd."
  },
  {
      "symbol": "AGO^F",
      "name": "Assured Guaranty Ltd."
  },
  {
      "symbol": "AGP",
      "name": "AMERIGROUP Corporation"
  },
  {
      "symbol": "AGRO",
      "name": "Adecoagro S.A."
  },
  {
      "symbol": "AGU",
      "name": "Agrium Inc."
  },
  {
      "symbol": "AGX",
      "name": "Argan, Inc."
  },
  {
      "symbol": "AGYS",
      "name": "Agilysys, Inc."
  },
  {
      "symbol": "AH",
      "name": "Accretive Health, Inc."
  },
  {
      "symbol": "AHC",
      "name": "A.H. Belo Corporation"
  },
  {
      "symbol": "AHGP",
      "name": "Alliance Holdings GP, L.P."
  },
  {
      "symbol": "AHL",
      "name": "Aspen Insurance Holdings Limited"
  },
  {
      "symbol": "AHL^",
      "name": "Aspen Insurance Holdings Limited"
  },
  {
      "symbol": "AHL^A",
      "name": "Aspen Insurance Holdings Limited"
  },
  {
      "symbol": "AHL^B",
      "name": "Aspen Insurance Holdings Limited"
  },
  {
      "symbol": "AHPI",
      "name": "Allied Healthcare Products, Inc."
  },
  {
      "symbol": "AHS",
      "name": "AMN Healthcare Services Inc"
  },
  {
      "symbol": "AHT",
      "name": "Ashford Hospitality Trust Inc"
  },
  {
      "symbol": "AHT^A",
      "name": "Ashford Hospitality Trust Inc"
  },
  {
      "symbol": "AHT^D",
      "name": "Ashford Hospitality Trust Inc"
  },
  {
      "symbol": "AHT^E",
      "name": "Ashford Hospitality Trust Inc"
  },
  {
      "symbol": "AI",
      "name": "Arlington Asset Investment Corp"
  },
  {
      "symbol": "AIG",
      "name": "American International Group, Inc."
  },
  {
      "symbol": "AIG/WS",
      "name": "American International Group, Inc."
  },
  {
      "symbol": "AIM",
      "name": "Aerosonic Corporation"
  },
  {
      "symbol": "AIMC",
      "name": "Altra Holdings, Inc."
  },
  {
      "symbol": "AIN",
      "name": "Albany International Corporation"
  },
  {
      "symbol": "AINV",
      "name": "Apollo Investment Corporation"
  },
  {
      "symbol": "AIQ",
      "name": "Alliance HealthCare Services, Inc."
  },
  {
      "symbol": "AIR",
      "name": "AAR Corp."
  },
  {
      "symbol": "AIRM",
      "name": "Air Methods Corporation"
  },
  {
      "symbol": "AIRT",
      "name": "Air T, Inc."
  },
  {
      "symbol": "AIS",
      "name": "Antares Pharma, Inc."
  },
  {
      "symbol": "AIT",
      "name": "Applied Industrial Technologies, Inc."
  },
  {
      "symbol": "AIV",
      "name": "Apartment Investment and Management Company"
  },
  {
      "symbol": "AIV^T",
      "name": "Apartment Investment and Management Company"
  },
  {
      "symbol": "AIV^U",
      "name": "Apartment Investment and Management Company"
  },
  {
      "symbol": "AIV^V",
      "name": "Apartment Investment and Management Company"
  },
  {
      "symbol": "AIV^Y",
      "name": "Apartment Investment and Management Company"
  },
  {
      "symbol": "AIV^Z",
      "name": "Apartment Investment and Management Company"
  },
  {
      "symbol": "AIXG",
      "name": "Aixtron SE"
  },
  {
      "symbol": "AIZ",
      "name": "Assurant, Inc."
  },
  {
      "symbol": "AJG",
      "name": "Arthur J. Gallagher & Co."
  },
  {
      "symbol": "AKAM",
      "name": "Akamai Technologies, Inc."
  },
  {
      "symbol": "AKO/A",
      "name": "Embotelladora Andina S.A."
  },
  {
      "symbol": "AKO/B",
      "name": "Embotelladora Andina S.A."
  },
  {
      "symbol": "AKP",
      "name": "Alliance California Municipal Income Fund Inc"
  },
  {
      "symbol": "AKR",
      "name": "Acadia Realty Trust"
  },
  {
      "symbol": "AKRX",
      "name": "Akorn, Inc."
  },
  {
      "symbol": "AKS",
      "name": "AK Steel Holding Corporation"
  },
  {
      "symbol": "AL",
      "name": "Air Lease Corporation"
  },
  {
      "symbol": "ALB",
      "name": "Albemarle Corporation"
  },
  {
      "symbol": "ALC",
      "name": "Assisted Living Concepts, Inc. New"
  },
  {
      "symbol": "ALCO",
      "name": "Alico, Inc."
  },
  {
      "symbol": "ALE",
      "name": "Allete, Inc."
  },
  {
      "symbol": "ALEX",
      "name": "Alexander & Baldwin, Inc."
  },
  {
      "symbol": "ALG",
      "name": "Alamo Group, Inc."
  },
  {
      "symbol": "ALGN",
      "name": "Align Technology, Inc."
  },
  {
      "symbol": "ALGT",
      "name": "Allegiant Travel Company"
  },
  {
      "symbol": "ALIM",
      "name": "Alimera Sciences, Inc."
  },
  {
      "symbol": "ALJ",
      "name": "Alon USA Energy, Inc."
  },
  {
      "symbol": "ALK",
      "name": "Alaska Air Group, Inc."
  },
  {
      "symbol": "ALKS",
      "name": "Alkermes plc"
  },
  {
      "symbol": "ALL",
      "name": "Allstate Corporation (The)"
  },
  {
      "symbol": "ALLB",
      "name": "Alliance Bancorp, Inc. of Pennsylvania"
  },
  {
      "symbol": "ALLT",
      "name": "Allot Communications Ltd."
  },
  {
      "symbol": "ALLY^A",
      "name": "GMAC Capital Trust I"
  },
  {
      "symbol": "ALLY^B",
      "name": "GMAC Capital Trust I"
  },
  {
      "symbol": "ALN",
      "name": "American Lorain Corporation"
  },
  {
      "symbol": "ALNC",
      "name": "Alliance Financial Corporation"
  },
  {
      "symbol": "ALNY",
      "name": "Alnylam Pharmaceuticals, Inc."
  },
  {
      "symbol": "ALOG",
      "name": "Analogic Corporation"
  },
  {
      "symbol": "ALOT",
      "name": "Astro-Med, Inc."
  },
  {
      "symbol": "ALP^N",
      "name": "Alabama Power Company"
  },
  {
      "symbol": "ALP^O",
      "name": "Alabama Power Company"
  },
  {
      "symbol": "ALP^P",
      "name": "Alabama Power Company"
  },
  {
      "symbol": "ALR",
      "name": "Alere Inc."
  },
  {
      "symbol": "ALR^B",
      "name": "Alere Inc."
  },
  {
      "symbol": "ALRN",
      "name": "American Learning Corporation"
  },
  {
      "symbol": "ALSK",
      "name": "Alaska Communications Systems Group, Inc."
  },
  {
      "symbol": "ALSN",
      "name": "Allison Transmission Holdings, Inc."
  },
  {
      "symbol": "ALTE",
      "name": "Alterra Capital Holdings Limited"
  },
  {
      "symbol": "ALTH",
      "name": "Allos Therapeutics, Inc."
  },
  {
      "symbol": "ALTI",
      "name": "Altair Nanotechnologies Inc."
  },
  {
      "symbol": "ALTR",
      "name": "Altera Corporation"
  },
  {
      "symbol": "ALU",
      "name": "Alcatel Lucent"
  },
  {
      "symbol": "ALV",
      "name": "Autoliv, Inc."
  },
  {
      "symbol": "ALVR",
      "name": "Alvarion Ltd."
  },
  {
      "symbol": "ALX",
      "name": "Alexander&#39;s, Inc."
  },
  {
      "symbol": "ALXA",
      "name": "Alexza Pharmaceuticals, Inc."
  },
  {
      "symbol": "ALXN",
      "name": "Alexion Pharmaceuticals, Inc."
  },
  {
      "symbol": "AM",
      "name": "American Greetings Corporation"
  },
  {
      "symbol": "AMAG",
      "name": "AMAG Pharmaceuticals, Inc."
  },
  {
      "symbol": "AMAP",
      "name": "AutoNavi Holdings Limited"
  },
  {
      "symbol": "AMAT",
      "name": "Applied Materials, Inc."
  },
  {
      "symbol": "AMBO",
      "name": "Ambow Education Holding Ltd."
  },
  {
      "symbol": "AMBT",
      "name": "Ambient Corporation"
  },
  {
      "symbol": "AMCC",
      "name": "Applied Micro Circuits Corporation"
  },
  {
      "symbol": "AMCF",
      "name": "Andatee China Marine Fuel Services Corporation"
  },
  {
      "symbol": "AMCN",
      "name": "AirMedia Group Inc"
  },
  {
      "symbol": "AMCX",
      "name": "AMC Networks Inc."
  },
  {
      "symbol": "AMD",
      "name": "Advanced Micro Devices, Inc."
  },
  {
      "symbol": "AME",
      "name": "AMTEK, Inc."
  },
  {
      "symbol": "AMED",
      "name": "Amedisys Inc"
  },
  {
      "symbol": "AMG",
      "name": "Affiliated Managers Group, Inc."
  },
  {
      "symbol": "AMGN",
      "name": "Amgen Inc."
  },
  {
      "symbol": "AMIC",
      "name": "American Independence Corp."
  },
  {
      "symbol": "AMID",
      "name": "American Midstream Partners, LP"
  },
  {
      "symbol": "AMKR",
      "name": "Amkor Technology, Inc."
  },
  {
      "symbol": "AMLN",
      "name": "Amylin Pharmaceuticals, Inc."
  },
  {
      "symbol": "AMNB",
      "name": "American National Bankshares, Inc."
  },
  {
      "symbol": "AMOT",
      "name": "Allied Motion Technologies, Inc."
  },
  {
      "symbol": "AMOV",
      "name": "America Movil, S.A.B. de C.V."
  },
  {
      "symbol": "AMP",
      "name": "AMERIPRISE FINANCIAL SERVICES, INC."
  },
  {
      "symbol": "AMP^A",
      "name": "AMERIPRISE FINANCIAL SERVICES, INC."
  },
  {
      "symbol": "AMPE",
      "name": "Ampio Pharmaceuticals, Inc."
  },
  {
      "symbol": "AMPL",
      "name": "Ampal-American Israel Corporation"
  },
  {
      "symbol": "AMRB",
      "name": "American River Bankshares"
  },
  {
      "symbol": "AMRC",
      "name": "Ameresco, Inc."
  },
  {
      "symbol": "AMRI",
      "name": "Albany Molecular Research, Inc."
  },
  {
      "symbol": "AMRN",
      "name": "Amarin Corporation PLC"
  },
  {
      "symbol": "AMRS",
      "name": "Amyris, Inc."
  },
  {
      "symbol": "AMS",
      "name": "American Shared Hospital Services"
  },
  {
      "symbol": "AMSC",
      "name": "American Superconductor Corporation"
  },
  {
      "symbol": "AMSF",
      "name": "AMERISAFE, Inc."
  },
  {
      "symbol": "AMSG",
      "name": "Amsurg Corp."
  },
  {
      "symbol": "AMSWA",
      "name": "American Software, Inc."
  },
  {
      "symbol": "AMT",
      "name": "American Tower Corporation (REIT)"
  },
  {
      "symbol": "AMTD",
      "name": "TD Ameritrade Holding Corporation"
  },
  {
      "symbol": "AMTG",
      "name": "Apollo Residential Mortgage, Inc."
  },
  {
      "symbol": "AMWD",
      "name": "American Woodmark Corporation"
  },
  {
      "symbol": "AMX",
      "name": "America Movil, S.A.B. de C.V."
  },
  {
      "symbol": "AMZN",
      "name": "Amazon.com, Inc."
  },
  {
      "symbol": "AN",
      "name": "AutoNation, Inc."
  },
  {
      "symbol": "ANAC",
      "name": "Anacor Pharmaceuticals, Inc."
  },
  {
      "symbol": "ANAD",
      "name": "ANADIGICS, Inc."
  },
  {
      "symbol": "ANAT",
      "name": "American National Insurance Company"
  },
  {
      "symbol": "ANCB",
      "name": "Anchor Bancorp"
  },
  {
      "symbol": "ANCI",
      "name": "American Caresource Holdings Inc"
  },
  {
      "symbol": "ANCX",
      "name": "Access National Corporation"
  },
  {
      "symbol": "ANDAU",
      "name": "Andina Acquisition Corporation"
  },
  {
      "symbol": "ANDE",
      "name": "The Andersons, Inc."
  },
  {
      "symbol": "ANEN",
      "name": "Anaren, Inc."
  },
  {
      "symbol": "ANF",
      "name": "Abercrombie & Fitch Company"
  },
  {
      "symbol": "ANGI",
      "name": "Angie&#39;s List, Inc."
  },
  {
      "symbol": "ANGN",
      "name": "Angeion Corporation"
  },
  {
      "symbol": "ANGO",
      "name": "AngioDynamics, Inc."
  },
  {
      "symbol": "ANH",
      "name": "Anworth Mortgage Asset  Corporation"
  },
  {
      "symbol": "ANH^A",
      "name": "Anworth Mortgage Asset  Corporation"
  },
  {
      "symbol": "ANH^B",
      "name": "Anworth Mortgage Asset  Corporation"
  },
  {
      "symbol": "ANIK",
      "name": "Anika Therapeutics Inc."
  },
  {
      "symbol": "ANLY",
      "name": "Analysts International Corporation"
  },
  {
      "symbol": "ANN",
      "name": "ANN INC."
  },
  {
      "symbol": "ANNB",
      "name": "Annapolis Bancorp Inc."
  },
  {
      "symbol": "ANO",
      "name": "Anooraq Resources Corporation"
  },
  {
      "symbol": "ANR",
      "name": "Alpha Natural Resources, inc."
  },
  {
      "symbol": "ANSS",
      "name": "ANSYS, Inc."
  },
  {
      "symbol": "ANTH",
      "name": "Anthera Pharmaceuticals, Inc."
  },
  {
      "symbol": "ANTP",
      "name": "PHAZAR CORP"
  },
  {
      "symbol": "ANV",
      "name": "Allied Nevada Gold Corp"
  },
  {
      "symbol": "ANW",
      "name": "Aegean Marine Petroleum Network Inc."
  },
  {
      "symbol": "ANX",
      "name": "ADVENTRX Pharmaceuticals, Inc."
  },
  {
      "symbol": "AOB",
      "name": "American Oriental Bioengineering, Inc."
  },
  {
      "symbol": "AOD",
      "name": "Alpine Total Dynamic Dividend Fund"
  },
  {
      "symbol": "AOI",
      "name": "Alliance One International, Inc."
  },
  {
      "symbol": "AOL",
      "name": "AOL Inc."
  },
  {
      "symbol": "AON",
      "name": "Aon plc"
  },
  {
      "symbol": "AONE",
      "name": "A123 Systems, Inc."
  },
  {
      "symbol": "AOS",
      "name": "Smith (A.O.) Corporation"
  },
  {
      "symbol": "AOSL",
      "name": "Alpha and Omega Semiconductor Limited"
  },
  {
      "symbol": "AP",
      "name": "Ampco-Pittsburgh Corporation"
  },
  {
      "symbol": "APA",
      "name": "Apache Corporation"
  },
  {
      "symbol": "APA^D",
      "name": "Apache Corporation"
  },
  {
      "symbol": "APAGF",
      "name": "Apco Oil and Gas International Inc."
  },
  {
      "symbol": "APB",
      "name": "Asia Pacific Fund, Inc. (The)"
  },
  {
      "symbol": "APC",
      "name": "Anadarko Petroleum Corporation"
  },
  {
      "symbol": "APD",
      "name": "Air Products and Chemicals, Inc."
  },
  {
      "symbol": "APEI",
      "name": "American Public Education, Inc."
  },
  {
      "symbol": "APF",
      "name": "Morgan Stanley Asia-Pacific Fund, Inc."
  },
  {
      "symbol": "APFC",
      "name": "American Pacific Corporation"
  },
  {
      "symbol": "APH",
      "name": "Amphenol Corporation"
  },
  {
      "symbol": "API",
      "name": "Advanced Photonix, Inc."
  },
  {
      "symbol": "APKT",
      "name": "Acme Packet, Inc."
  },
  {
      "symbol": "APL",
      "name": "Atlas Pipeline Partners, L.P."
  },
  {
      "symbol": "APO",
      "name": "Apollo Global Management, LLC"
  },
  {
      "symbol": "APOG",
      "name": "Apogee Enterprises, Inc."
  },
  {
      "symbol": "APOL",
      "name": "Apollo Group, Inc."
  },
  {
      "symbol": "APP",
      "name": "American Apparel Inc"
  },
  {
      "symbol": "APPY",
      "name": "AspenBio Pharma, Inc."
  },
  {
      "symbol": "APRI",
      "name": "Apricus Biosciences, Inc"
  },
  {
      "symbol": "APSA",
      "name": "Alto Palermo S.A."
  },
  {
      "symbol": "APT",
      "name": "Alpha Pro Tech, Ltd."
  },
  {
      "symbol": "APTS",
      "name": "Preferred Apartment Communities, Inc."
  },
  {
      "symbol": "APU",
      "name": "AmeriGas Partners, L.P."
  },
  {
      "symbol": "APWC",
      "name": "Asia Pacific Wire & Cable Corporation Limited"
  },
  {
      "symbol": "AQ            ",
      "name": "Acquity Group Limited"
  },
  {
      "symbol": "AQQ",
      "name": "American Spectrum Realty, Inc."
  },
  {
      "symbol": "ARAY",
      "name": "Accuray Incorporated"
  },
  {
      "symbol": "ARB",
      "name": "Arbitron Inc."
  },
  {
      "symbol": "ARBA",
      "name": "Ariba, Inc."
  },
  {
      "symbol": "ARC",
      "name": "American Reprographics Company"
  },
  {
      "symbol": "ARCC",
      "name": "Ares Capital Corporation"
  },
  {
      "symbol": "ARCI",
      "name": "Appliance Recycling Centers of America, Inc."
  },
  {
      "symbol": "ARCL",
      "name": "Archipelago Learning, Inc."
  },
  {
      "symbol": "ARCO",
      "name": "Arcos Dorados Holdings Inc."
  },
  {
      "symbol": "ARCP",
      "name": "American Realty Capital Properties, Inc."
  },
  {
      "symbol": "ARCT          ",
      "name": "American Realty Capital Trust, Inc."
  },
  {
      "symbol": "ARCW",
      "name": "Arc Wireless Solutions, Inc."
  },
  {
      "symbol": "ARDNA",
      "name": "Arden Group, Inc."
  },
  {
      "symbol": "ARE",
      "name": "Alexandria Real Estate Equities, Inc."
  },
  {
      "symbol": "ARE^E",
      "name": "Alexandria Real Estate Equities, Inc."
  },
  {
      "symbol": "AREX",
      "name": "Approach Resources Inc."
  },
  {
      "symbol": "ARG",
      "name": "Airgas, Inc."
  },
  {
      "symbol": "ARGN",
      "name": "Amerigon Incorporated"
  },
  {
      "symbol": "ARH^C",
      "name": "Arch Capital Group Ltd."
  },
  {
      "symbol": "ARI",
      "name": "Apollo Commercial Real Estate Finance"
  },
  {
      "symbol": "ARIA",
      "name": "ARIAD Pharmaceuticals, Inc."
  },
  {
      "symbol": "ARII",
      "name": "American Railcar Industries, Inc."
  },
  {
      "symbol": "ARK",
      "name": "Senior High Income Portfolio, Inc."
  },
  {
      "symbol": "ARKR",
      "name": "Ark Restaurants Corp."
  },
  {
      "symbol": "ARL",
      "name": "American Realty Investors, Inc."
  },
  {
      "symbol": "ARLP",
      "name": "Alliance Resource Partners, L.P."
  },
  {
      "symbol": "ARMH",
      "name": "ARM Holdings, plc"
  },
  {
      "symbol": "ARN",
      "name": "Ares Capital Corporation"
  },
  {
      "symbol": "ARNA",
      "name": "Arena Pharmaceuticals, Inc."
  },
  {
      "symbol": "ARO",
      "name": "Aeropostale Inc"
  },
  {
      "symbol": "AROW",
      "name": "Arrow Financial Corporation"
  },
  {
      "symbol": "ARP",
      "name": "Atlas Resource Partners, L.P."
  },
  {
      "symbol": "ARQL",
      "name": "ArQule, Inc."
  },
  {
      "symbol": "ARR",
      "name": "Armour Residential R"
  },
  {
      "symbol": "ARR/WS",
      "name": "Armour Residential R"
  },
  {
      "symbol": "ARRS",
      "name": "Arris Group Inc"
  },
  {
      "symbol": "ARRY",
      "name": "Array BioPharma Inc."
  },
  {
      "symbol": "ARSD",
      "name": "Arabian American Development Company"
  },
  {
      "symbol": "ART",
      "name": "ARTIO GLOBAL INVESTORS INC."
  },
  {
      "symbol": "ARTC",
      "name": "ArthroCare Corporation"
  },
  {
      "symbol": "ARTNA",
      "name": "Artesian Resources Corporation"
  },
  {
      "symbol": "ARTW",
      "name": "Art&#39;s-Way Manufacturing Co., Inc."
  },
  {
      "symbol": "ARTX",
      "name": "Arotech Corporation"
  },
  {
      "symbol": "ARUN",
      "name": "Aruba Networks, Inc."
  },
  {
      "symbol": "ARW",
      "name": "Arrow Electronics, Inc."
  },
  {
      "symbol": "ARWR",
      "name": "Arrowhead Research Corporation"
  },
  {
      "symbol": "ARX",
      "name": "Aeroflex Holding Corp."
  },
  {
      "symbol": "ARY",
      "name": "Ares Capital Corporation"
  },
  {
      "symbol": "ASA",
      "name": "ASA Gold and Precious Metals Limited"
  },
  {
      "symbol": "ASBB",
      "name": "ASB Bancorp, Inc."
  },
  {
      "symbol": "ASBC",
      "name": "Associated Banc-Corp"
  },
  {
      "symbol": "ASBCW",
      "name": "Associated Banc-Corp"
  },
  {
      "symbol": "ASBI",
      "name": "Ameriana Bancorp"
  },
  {
      "symbol": "ASCA",
      "name": "Ameristar Casinos, Inc."
  },
  {
      "symbol": "ASCMA",
      "name": "Ascent Capital Group, Inc."
  },
  {
      "symbol": "ASEI",
      "name": "American Science and Engineering, Inc."
  },
  {
      "symbol": "ASFI",
      "name": "Asta Funding, Inc."
  },
  {
      "symbol": "ASG",
      "name": "Liberty All-Star Growth Fund, Inc."
  },
  {
      "symbol": "ASGN",
      "name": "On Assignment, Inc."
  },
  {
      "symbol": "ASH",
      "name": "Ashland Inc."
  },
  {
      "symbol": "ASI",
      "name": "American Safety Insurance Holdings, Ltd."
  },
  {
      "symbol": "ASIA",
      "name": "AsiaInfo-Linkage, Inc."
  },
  {
      "symbol": "ASM",
      "name": "Avino Silver"
  },
  {
      "symbol": "ASMI",
      "name": "ASM International N.V."
  },
  {
      "symbol": "ASML",
      "name": "ASML Holding N.V."
  },
  {
      "symbol": "ASNA",
      "name": "Ascena Retail Group, Inc."
  },
  {
      "symbol": "ASP",
      "name": "American Strategic Income Portfolio"
  },
  {
      "symbol": "ASPS",
      "name": "Altisource Portfolio Solutions S.A."
  },
  {
      "symbol": "ASR",
      "name": "Grupo Aeroportuario del Sureste, S.A. de C.V."
  },
  {
      "symbol": "ASRV",
      "name": "AmeriServ Financial Inc."
  },
  {
      "symbol": "ASRVP",
      "name": "AmeriServ Financial Inc."
  },
  {
      "symbol": "ASTC",
      "name": "Astrotech Corporation"
  },
  {
      "symbol": "ASTE",
      "name": "Astec Industries, Inc."
  },
  {
      "symbol": "ASTI",
      "name": "Ascent Solar Technologies, Inc."
  },
  {
      "symbol": "ASTM",
      "name": "Aastrom Biosciences, Inc."
  },
  {
      "symbol": "ASTX",
      "name": "Astex Pharmaceuticals, Inc."
  },
  {
      "symbol": "ASUR",
      "name": "Asure Software Inc"
  },
  {
      "symbol": "ASX",
      "name": "Advanced Semiconductor Engineering, Inc."
  },
  {
      "symbol": "ASYS",
      "name": "Amtech Systems, Inc."
  },
  {
      "symbol": "AT",
      "name": "Atlantic Power Corporation"
  },
  {
      "symbol": "ATAI",
      "name": "ATA Inc."
  },
  {
      "symbol": "ATAX",
      "name": "America First Tax Exempt Investors, L.P."
  },
  {
      "symbol": "ATC",
      "name": "ATC Venture Group Inc."
  },
  {
      "symbol": "ATE",
      "name": "Advantest Corporation (Kabushiki Kaisha Advantest) ADS"
  },
  {
      "symbol": "ATEA",
      "name": "Astea International, Inc."
  },
  {
      "symbol": "ATEC",
      "name": "Alphatec Holdings, Inc."
  },
  {
      "symbol": "ATHN",
      "name": "athenahealth, Inc."
  },
  {
      "symbol": "ATHX",
      "name": "Athersys, Inc."
  },
  {
      "symbol": "ATI",
      "name": "Allegheny Technologies Incorporated"
  },
  {
      "symbol": "ATK",
      "name": "Alliant Techsystems Inc."
  },
  {
      "symbol": "ATLO",
      "name": "Ames National Corporation"
  },
  {
      "symbol": "ATLS",
      "name": "Atlas Energy, L.P."
  },
  {
      "symbol": "ATMI",
      "name": "ATMI Inc."
  },
  {
      "symbol": "ATML",
      "name": "Atmel Corporation"
  },
  {
      "symbol": "ATNI",
      "name": "Atlantic Tele-Network, Inc."
  },
  {
      "symbol": "ATNY",
      "name": "API Technologies Corp."
  },
  {
      "symbol": "ATO",
      "name": "Atmos Energy Corporation"
  },
  {
      "symbol": "ATPG",
      "name": "ATP Oil & Gas Corporation"
  },
  {
      "symbol": "ATR",
      "name": "AptarGroup, Inc."
  },
  {
      "symbol": "ATRC",
      "name": "AtriCure, Inc."
  },
  {
      "symbol": "ATRI",
      "name": "ATRION Corporation"
  },
  {
      "symbol": "ATRM",
      "name": "Aetrium Incorporated"
  },
  {
      "symbol": "ATRO",
      "name": "Astronics Corporation"
  },
  {
      "symbol": "ATSG",
      "name": "Air Transport Services Group, Inc"
  },
  {
      "symbol": "ATU",
      "name": "Actuant Corporation"
  },
  {
      "symbol": "ATV",
      "name": "Acorn International, Inc."
  },
  {
      "symbol": "ATVI",
      "name": "Activision Blizzard, Inc"
  },
  {
      "symbol": "ATW",
      "name": "Atwood Oceanics, Inc."
  },
  {
      "symbol": "ATX",
      "name": "Cross (A.T.) Company"
  },
  {
      "symbol": "AU",
      "name": "AngloGold Ashanti Ltd."
  },
  {
      "symbol": "AU^A",
      "name": "AngloGold Ashanti Ltd."
  },
  {
      "symbol": "AUBN",
      "name": "Auburn National Bancorporation, Inc."
  },
  {
      "symbol": "AUDC",
      "name": "AudioCodes Ltd."
  },
  {
      "symbol": "AUMN",
      "name": "Golden Minerals Co."
  },
  {
      "symbol": "AUO",
      "name": "AU Optronics Corp"
  },
  {
      "symbol": "AUQ",
      "name": "AuRico Gold Inc."
  },
  {
      "symbol": "AUTH",
      "name": "AuthenTec, Inc."
  },
  {
      "symbol": "AUXL",
      "name": "Auxilium Pharmaceuticals, Inc."
  },
  {
      "symbol": "AUY",
      "name": "Yamana Gold, Inc."
  },
  {
      "symbol": "AV",
      "name": "Aviva plc"
  },
  {
      "symbol": "AVA",
      "name": "Avista Corporation"
  },
  {
      "symbol": "AVAV",
      "name": "AeroVironment, Inc."
  },
  {
      "symbol": "AVB",
      "name": "AvalonBay Communities, Inc."
  },
  {
      "symbol": "AVCA",
      "name": "Advocat, Inc."
  },
  {
      "symbol": "AVD",
      "name": "American Vanguard Corporation"
  },
  {
      "symbol": "AVEO",
      "name": "AVEO Pharmaceuticals, Inc."
  },
  {
      "symbol": "AVF",
      "name": "American International Group, Inc."
  },
  {
      "symbol": "AVG",
      "name": "AVG Technologies N.V."
  },
  {
      "symbol": "AVGO",
      "name": "Avago Technologies Limited"
  },
  {
      "symbol": "AVHI",
      "name": "A V Homes, Inc."
  },
  {
      "symbol": "AVID",
      "name": "Avid Technology, Inc."
  },
  {
      "symbol": "AVII",
      "name": "AVI BioPharma, Inc."
  },
  {
      "symbol": "AVK",
      "name": "Advent Claymore Convertible Securities and Income Fund"
  },
  {
      "symbol": "AVL",
      "name": "Avalon Rare Metals, Inc."
  },
  {
      "symbol": "AVNR",
      "name": "Avanir Pharmaceuticals, Inc."
  },
  {
      "symbol": "AVNW",
      "name": "Aviat Networks, Inc."
  },
  {
      "symbol": "AVP",
      "name": "Avon Products, Inc."
  },
  {
      "symbol": "AVT",
      "name": "Avnet, Inc."
  },
  {
      "symbol": "AVV",
      "name": "Aviva plc"
  },
  {
      "symbol": "AVX",
      "name": "AVX Corporation"
  },
  {
      "symbol": "AVY",
      "name": "Avery Dennison Corporation"
  },
  {
      "symbol": "AWAY",
      "name": "HomeAway, Inc."
  },
  {
      "symbol": "AWC",
      "name": "Alumina Ltd"
  },
  {
      "symbol": "AWF",
      "name": "Alliance World Dollar Government Fund II"
  },
  {
      "symbol": "AWH",
      "name": "Allied World Assurance Company Holdings, AG"
  },
  {
      "symbol": "AWI",
      "name": "Armstrong World Industries Inc"
  },
  {
      "symbol": "AWK",
      "name": "American Water Works"
  },
  {
      "symbol": "AWP",
      "name": "Alpine Global Premier Properties Fund"
  },
  {
      "symbol": "AWR",
      "name": "American States Water Company"
  },
  {
      "symbol": "AWRE",
      "name": "Aware, Inc."
  },
  {
      "symbol": "AWX",
      "name": "Avalon Holdings Corporation"
  },
  {
      "symbol": "AXAS",
      "name": "Abraxas Petroleum Corporation"
  },
  {
      "symbol": "AXE",
      "name": "Anixter International Inc."
  },
  {
      "symbol": "AXFN",
      "name": "iShares MSCI ACWI ex US Financials Sector Index Fund"
  },
  {
      "symbol": "AXJS",
      "name": "iShares Trust iShares MSCI All Country Asia ex Japan Small Cap"
  },
  {
      "symbol": "AXK",
      "name": "Accelr8 Technology Corporation"
  },
  {
      "symbol": "AXL",
      "name": "American Axle & Manufacturing Holdings, Inc."
  },
  {
      "symbol": "AXN",
      "name": "China Aoxing Pharmaceutical Company, Inc."
  },
  {
      "symbol": "AXP",
      "name": "American Express Company"
  },
  {
      "symbol": "AXR",
      "name": "AMREP Corporation"
  },
  {
      "symbol": "AXS",
      "name": "Axis Capital Holdings Limited"
  },
  {
      "symbol": "AXS^A",
      "name": "Axis Capital Holdings Limited"
  },
  {
      "symbol": "AXS^C",
      "name": "Axis Capital Holdings Limited"
  },
  {
      "symbol": "AXTI",
      "name": "AXT Inc"
  },
  {
      "symbol": "AXU",
      "name": "Alexco Resource Corp"
  },
  {
      "symbol": "AXX",
      "name": "Alderon Iron Ore Corp."
  },
  {
      "symbol": "AYI",
      "name": "Acuity Brands Inc"
  },
  {
      "symbol": "AYN",
      "name": "Alliance New York Municipal Income Fund Inc"
  },
  {
      "symbol": "AYR",
      "name": "Aircastle Limited"
  },
  {
      "symbol": "AZC",
      "name": "Augusta Resource Corporation"
  },
  {
      "symbol": "AZK",
      "name": "Aurizon Mines, Ltd."
  },
  {
      "symbol": "AZN",
      "name": "Astrazeneca PLC"
  },
  {
      "symbol": "AZO",
      "name": "AutoZone, Inc."
  },
  {
      "symbol": "AZPN",
      "name": "Aspen Technology, Inc."
  },
  {
      "symbol": "AZZ",
      "name": "AZZ Incorporated"
  },
  {
      "symbol": "B",
      "name": "Barnes Group, Inc."
  },
  {
      "symbol": "BA",
      "name": "Boeing Company (The)"
  },
  {
      "symbol": "BAA",
      "name": "BANRO CORPORATION"
  },
  {
      "symbol": "BABY",
      "name": "Natus Medical Incorporated"
  },
  {
      "symbol": "BAC",
      "name": "Bank of America Corporation"
  },
  {
      "symbol": "BAC/WS/A",
      "name": "Bank of America Corporation"
  },
  {
      "symbol": "BAC/WS/B",
      "name": "Bank of America Corporation"
  },
  {
      "symbol": "BAC^B",
      "name": "Bank of America Corporation"
  },
  {
      "symbol": "BAC^C",
      "name": "Bank of America Corporation"
  },
  {
      "symbol": "BAC^D",
      "name": "Bank of America Corporation"
  },
  {
      "symbol": "BAC^E",
      "name": "Bank of America Corporation"
  },
  {
      "symbol": "BAC^H",
      "name": "Bank of America Corporation"
  },
  {
      "symbol": "BAC^I",
      "name": "Bank of America Corporation"
  },
  {
      "symbol": "BAC^J",
      "name": "Bank of America Corporation"
  },
  {
      "symbol": "BAC^L",
      "name": "Bank of America Corporation"
  },
  {
      "symbol": "BAC^U",
      "name": "Bank of America Corporation"
  },
  {
      "symbol": "BAC^V",
      "name": "Bank of America Corporation"
  },
  {
      "symbol": "BAC^W",
      "name": "Bank of America Corporation"
  },
  {
      "symbol": "BAC^X",
      "name": "Bank of America Corporation"
  },
  {
      "symbol": "BAC^Y",
      "name": "Bank of America Corporation"
  },
  {
      "symbol": "BAC^Z",
      "name": "Bank of America Corporation"
  },
  {
      "symbol": "BAF",
      "name": "BlackRock Income Investment Quality Trust"
  },
  {
      "symbol": "BAGL",
      "name": "Einstein Noah Restaurant Group, Inc."
  },
  {
      "symbol": "BAH",
      "name": "Booz Allen Hamilton Holding Corporation"
  },
  {
      "symbol": "BAK",
      "name": "Copene-Petroquimica do Nordeste"
  },
  {
      "symbol": "BALT",
      "name": "Baltic Trading Limited"
  },
  {
      "symbol": "BAM",
      "name": "Brookfield Asset Management Inc"
  },
  {
      "symbol": "BAMM",
      "name": "Books-A-Million, Inc."
  },
  {
      "symbol": "BANC",
      "name": "First PacTrust Bancorp, Inc."
  },
  {
      "symbol": "BANF",
      "name": "BancFirst Corporation"
  },
  {
      "symbol": "BANFP",
      "name": "BancFirst Corporation"
  },
  {
      "symbol": "BANR",
      "name": "Banner Corporation"
  },
  {
      "symbol": "BAP",
      "name": "Credicorp Ltd."
  },
  {
      "symbol": "BAS",
      "name": "Basic Energy Services, Inc."
  },
  {
      "symbol": "BASI",
      "name": "Bioanalytical Systems, Inc."
  },
  {
      "symbol": "BAX",
      "name": "Baxter International Inc."
  },
  {
      "symbol": "BBBY",
      "name": "Bed Bath & Beyond Inc."
  },
  {
      "symbol": "BBCN",
      "name": "BBCN Bancorp, Inc."
  },
  {
      "symbol": "BBD",
      "name": "Banco Bradesco Sa"
  },
  {
      "symbol": "BBDO",
      "name": "Banco Bradesco Sa"
  },
  {
      "symbol": "BBEP",
      "name": "BreitBurn Energy Partners, L.P."
  },
  {
      "symbol": "BBF",
      "name": "BlackRock Municipal Income Investment Trust"
  },
  {
      "symbol": "BBG",
      "name": "Bill Barrett Corporation"
  },
  {
      "symbol": "BBGI",
      "name": "Beasley Broadcast Group, Inc."
  },
  {
      "symbol": "BBK",
      "name": "Blackrock Municipal Bond Trust"
  },
  {
      "symbol": "BBL",
      "name": "BHP Billiton plc"
  },
  {
      "symbol": "BBN",
      "name": "BalckRock Build America Bond Trust"
  },
  {
      "symbol": "BBNK",
      "name": "Bridge Capital Holdings"
  },
  {
      "symbol": "BBOX",
      "name": "Black Box Corporation"
  },
  {
      "symbol": "BBRG",
      "name": "Bravo Brio Restaurant Group, Inc."
  },
  {
      "symbol": "BBSI",
      "name": "Barrett Business Services, Inc."
  },
  {
      "symbol": "BBT",
      "name": "BB&T Corporation"
  },
  {
      "symbol": "BBT^A",
      "name": "BB&T Corporation"
  },
  {
      "symbol": "BBT^B",
      "name": "BB&T Corporation"
  },
  {
      "symbol": "BBT^C",
      "name": "BB&T Corporation"
  },
  {
      "symbol": "BBVA",
      "name": "Banco Bilbao Viscaya Argentaria S.A."
  },
  {
      "symbol": "BBW",
      "name": "Build-A-Bear Workshop, Inc."
  },
  {
      "symbol": "BBX",
      "name": "BankAtlantic Bancorp, Inc."
  },
  {
      "symbol": "BBXT",
      "name": "BankAtlantic Bancorp, Inc."
  },
  {
      "symbol": "BBY",
      "name": "Best Buy Co., Inc."
  },
  {
      "symbol": "BC",
      "name": "Brunswick Corporation"
  },
  {
      "symbol": "BCA",
      "name": "Corpbanca"
  },
  {
      "symbol": "BCBP",
      "name": "BCB Bancorp, Inc. (NJ)"
  },
  {
      "symbol": "BCDS",
      "name": "BCD Semiconductor Manufacturing Limited"
  },
  {
      "symbol": "BCE",
      "name": "BCE, Inc."
  },
  {
      "symbol": "BCEI",
      "name": "Bonanza Creek Energy, Inc."
  },
  {
      "symbol": "BCF",
      "name": "Blackrock Real Asset Equity Trust"
  },
  {
      "symbol": "BCH",
      "name": "Banco De Chile"
  },
  {
      "symbol": "BCO",
      "name": "Brink&#39;s Company (The)"
  },
  {
      "symbol": "BCOM",
      "name": "B Communications Ltd."
  },
  {
      "symbol": "BCOV",
      "name": "Brightcove Inc."
  },
  {
      "symbol": "BCPC",
      "name": "Balchem Corporation"
  },
  {
      "symbol": "BCR",
      "name": "C.R. Bard, Inc."
  },
  {
      "symbol": "BCRX",
      "name": "BioCryst Pharmaceuticals, Inc."
  },
  {
      "symbol": "BCS",
      "name": "Barclays PLC"
  },
  {
      "symbol": "BCS^",
      "name": "Barclays PLC"
  },
  {
      "symbol": "BCS^A",
      "name": "Barclays PLC"
  },
  {
      "symbol": "BCS^C",
      "name": "Barclays PLC"
  },
  {
      "symbol": "BCS^D",
      "name": "Barclays PLC"
  },
  {
      "symbol": "BCSB",
      "name": "BCSB Bancorp, Inc."
  },
  {
      "symbol": "BCV",
      "name": "Bancroft Convertible Fund, Inc."
  },
  {
      "symbol": "BCX",
      "name": "BlackRock Resources"
  },
  {
      "symbol": "BDC",
      "name": "Belden Inc"
  },
  {
      "symbol": "BDE",
      "name": "Black Diamond, Inc."
  },
  {
      "symbol": "BDGE",
      "name": "Bridge Bancorp, Inc."
  },
  {
      "symbol": "BDJ",
      "name": "Blackrock Enhanced Equity Dividend Trust"
  },
  {
      "symbol": "BDL",
      "name": "Flanigan&#39;s Enterprises, Inc."
  },
  {
      "symbol": "BDMS",
      "name": "Birner Dental Management Services, Inc."
  },
  {
      "symbol": "BDN",
      "name": "Brandywine Realty Trust"
  },
  {
      "symbol": "BDN^D",
      "name": "Brandywine Realty Trust"
  },
  {
      "symbol": "BDN^E",
      "name": "Brandywine Realty Tr"
  },
  {
      "symbol": "BDR",
      "name": "Blonder Tongue Laboratories, Inc."
  },
  {
      "symbol": "BDSI",
      "name": "BioDelivery Sciences International, Inc."
  },
  {
      "symbol": "BDX",
      "name": "Becton, Dickinson and Company"
  },
  {
      "symbol": "BEAM",
      "name": "Beam Inc."
  },
  {
      "symbol": "BEAM^A",
      "name": "Beam Inc."
  },
  {
      "symbol": "BEAT",
      "name": "CardioNet, Inc."
  },
  {
      "symbol": "BEAV",
      "name": "BE Aerospace, Inc."
  },
  {
      "symbol": "BEBE",
      "name": "bebe stores, inc."
  },
  {
      "symbol": "BECN",
      "name": "Beacon Roofing Supply, Inc."
  },
  {
      "symbol": "BEE",
      "name": "Strategic Hotels & Resorts Inc"
  },
  {
      "symbol": "BEE^A",
      "name": "Strategic Hotels & Resorts Inc"
  },
  {
      "symbol": "BEE^B",
      "name": "Strategic Hotels & Resorts Inc"
  },
  {
      "symbol": "BEE^C",
      "name": "Strategic Hotels & Resorts Inc"
  },
  {
      "symbol": "BELFA",
      "name": "Bel Fuse Inc."
  },
  {
      "symbol": "BELFB",
      "name": "Bel Fuse Inc."
  },
  {
      "symbol": "BEN",
      "name": "Franklin Resources, Inc."
  },
  {
      "symbol": "BERK",
      "name": "Berkshire Bancorp, Inc."
  },
  {
      "symbol": "BEST",
      "name": "Shiner International, Inc."
  },
  {
      "symbol": "BF/A",
      "name": "Brown Forman Corporation"
  },
  {
      "symbol": "BF/B",
      "name": "Brown Forman Corporation"
  },
  {
      "symbol": "BFED",
      "name": "Beacon Federal Bancorp, Inc."
  },
  {
      "symbol": "BFIN",
      "name": "BankFinancial Corporation"
  },
  {
      "symbol": "BFK",
      "name": "BlackRock Municipal Income Trust"
  },
  {
      "symbol": "BFLY",
      "name": "Bluefly, Inc."
  },
  {
      "symbol": "BFO",
      "name": "Blackrock Florida Municipal 2020 Term Trust"
  },
  {
      "symbol": "BFR",
      "name": "BBVA Banco Frances S.A."
  },
  {
      "symbol": "BFS",
      "name": "Saul Centers, Inc."
  },
  {
      "symbol": "BFS^A",
      "name": "Saul Centers, Inc."
  },
  {
      "symbol": "BFS^B",
      "name": "Saul Centers, Inc."
  },
  {
      "symbol": "BFY",
      "name": "BlackRock New York Municipal Income Trust II"
  },
  {
      "symbol": "BFZ",
      "name": "BlackRock California Municipal Income Trust"
  },
  {
      "symbol": "BG",
      "name": "Bunge Limited"
  },
  {
      "symbol": "BGC",
      "name": "General Cable Corporation"
  },
  {
      "symbol": "BGCP",
      "name": "BGC Partners, Inc."
  },
  {
      "symbol": "BGE^B",
      "name": "Baltimore Gas & Electric Company"
  },
  {
      "symbol": "BGFV",
      "name": "Big 5 Sporting Goods Corporation"
  },
  {
      "symbol": "BGG",
      "name": "Briggs & Stratton Corporation"
  },
  {
      "symbol": "BGMD",
      "name": "BG Medicine, Inc."
  },
  {
      "symbol": "BGR",
      "name": "BlackRock Energy and Resources Trust"
  },
  {
      "symbol": "BGS",
      "name": "B&G Foods Holdings Corp."
  },
  {
      "symbol": "BGSCU",
      "name": "BGS Acquisition Corp."
  },
  {
      "symbol": "BGT",
      "name": "Blackrock Global"
  },
  {
      "symbol": "BGX",
      "name": "Blackstone GSO Long Short Credit Income Fund"
  },
  {
      "symbol": "BGY",
      "name": "BLACKROCK INTERNATIONAL, LTD."
  },
  {
      "symbol": "BH",
      "name": "Biglari Holdings Inc."
  },
  {
      "symbol": "BHB",
      "name": "Bar Harbor Bankshares, Inc."
  },
  {
      "symbol": "BHD",
      "name": "Blackrock Strategic Bond Trust"
  },
  {
      "symbol": "BHE",
      "name": "Benchmark Electronics, Inc."
  },
  {
      "symbol": "BHI",
      "name": "Baker Hughes Incorporated"
  },
  {
      "symbol": "BHK",
      "name": "Blackrock Core Bond Trust"
  },
  {
      "symbol": "BHL",
      "name": "Blackrock Defined Opportunity Credit Trust"
  },
  {
      "symbol": "BHLB",
      "name": "Berkshire Hills Bancorp, Inc."
  },
  {
      "symbol": "BHP",
      "name": "BHP Billiton Limited"
  },
  {
      "symbol": "BHV",
      "name": "BlackRock Virginia Municipal Bond Trust"
  },
  {
      "symbol": "BHY",
      "name": "Blackrock High Yield Trust (The)"
  },
  {
      "symbol": "BIB",
      "name": "ProShares Trust ProShares Ultra Nasdaq Biotechnology"
  },
  {
      "symbol": "BICK",
      "name": "First Trust Exchange-Traded Fund II First Trust BICK Index Fun"
  },
  {
      "symbol": "BID",
      "name": "Sotheby&#39;s"
  },
  {
      "symbol": "BIDU",
      "name": "Baidu, Inc."
  },
  {
      "symbol": "BIDZ",
      "name": "Bidz.com, Inc."
  },
  {
      "symbol": "BIE",
      "name": "Blackrock Municipal Bond Investment Trust"
  },
  {
      "symbol": "BIF",
      "name": "USLIFE Income Fund, Inc."
  },
  {
      "symbol": "BIG",
      "name": "Big Lots, Inc."
  },
  {
      "symbol": "BIIB",
      "name": "Biogen Idec Inc."
  },
  {
      "symbol": "BIN",
      "name": "Progressive Waste Solutions Ltd."
  },
  {
      "symbol": "BIO",
      "name": "Bio-Rad Laboratories, Inc."
  },
  {
      "symbol": "BIO/B",
      "name": "Bio-Rad Laboratories, Inc."
  },
  {
      "symbol": "BIOC",
      "name": "BioClinica, Inc"
  },
  {
      "symbol": "BIOD",
      "name": "Biodel Inc."
  },
  {
      "symbol": "BIOF",
      "name": "BioFuel Energy Corp."
  },
  {
      "symbol": "BIOS",
      "name": "BioScrip, Inc."
  },
  {
      "symbol": "BIP",
      "name": "Brookfield Infrastructure Partners LP"
  },
  {
      "symbol": "BIR^A",
      "name": "Berkshire Income Realty, Inc."
  },
  {
      "symbol": "BIRT",
      "name": "Actuate Corporation"
  },
  {
      "symbol": "BIS",
      "name": "ProShares Trust ProShares UltraShort Nasdaq Biotechnology"
  },
  {
      "symbol": "BITA",
      "name": "Bitauto Holdings Limited"
  },
  {
      "symbol": "BJRI",
      "name": "BJ&#39;s Restaurants, Inc."
  },
  {
      "symbol": "BJZ",
      "name": "Blackrock California Municipal 2018 Term Trust"
  },
  {
      "symbol": "BK",
      "name": "Bank Of New York Mellon Corporation (The)"
  },
  {
      "symbol": "BK^E",
      "name": "Bank Of New York Mellon Corporation (The)"
  },
  {
      "symbol": "BK^F",
      "name": "Bank Of New York Mellon Corporation (The)"
  },
  {
      "symbol": "BKBK",
      "name": "Britton & Koontz Capital Corporation"
  },
  {
      "symbol": "BKCC",
      "name": "BlackRock Kelso Capital Corporation"
  },
  {
      "symbol": "BKD",
      "name": "Brookdale Senior Living Inc."
  },
  {
      "symbol": "BKE",
      "name": "Buckle, Inc. (The)"
  },
  {
      "symbol": "BKEP",
      "name": "Blueknight Energy Partners L.P., L.L.C."
  },
  {
      "symbol": "BKEPP",
      "name": "Blueknight Energy Partners L.P., L.L.C."
  },
  {
      "symbol": "BKH",
      "name": "Black Hills Corporation"
  },
  {
      "symbol": "BKI",
      "name": "Buckeye Technologies, Inc."
  },
  {
      "symbol": "BKJ",
      "name": "Bancorp of New Jersey, Inc"
  },
  {
      "symbol": "BKK",
      "name": "Blackrock Municipal 2020 Term Trust"
  },
  {
      "symbol": "BKMU",
      "name": "Bank Mutual Corporation"
  },
  {
      "symbol": "BKN",
      "name": "BlackRock Investment Quality Municipal Trust Inc. (The)"
  },
  {
      "symbol": "BKOR",
      "name": "Oak Ridge Financial Services, Inc."
  },
  {
      "symbol": "BKR",
      "name": "Baker (Michael) Corporation"
  },
  {
      "symbol": "BKS",
      "name": "Barnes & Noble, Inc."
  },
  {
      "symbol": "BKSC",
      "name": "Bank of South Carolina Corp."
  },
  {
      "symbol": "BKT",
      "name": "BlackRock Income Trust Inc. (The)"
  },
  {
      "symbol": "BKU",
      "name": "BankUnited, Inc."
  },
  {
      "symbol": "BKYF",
      "name": "The Bank of Kentucky Financial Corp."
  },
  {
      "symbol": "BLC",
      "name": "Belo Corporation"
  },
  {
      "symbol": "BLDP",
      "name": "Ballard Power Systems, Inc."
  },
  {
      "symbol": "BLDR",
      "name": "Builders FirstSource, Inc."
  },
  {
      "symbol": "BLE",
      "name": "BlackRock Municipal Income Trust II"
  },
  {
      "symbol": "BLH",
      "name": "Blackrock New York Municipal 2018 Term Trust"
  },
  {
      "symbol": "BLIN          ",
      "name": "Bridgeline Digital, Inc."
  },
  {
      "symbol": "BLJ",
      "name": "Blackrock New Jersey Municipal Bond Trust"
  },
  {
      "symbol": "BLK",
      "name": "BlackRock, Inc."
  },
  {
      "symbol": "BLKB",
      "name": "Blackbaud, Inc."
  },
  {
      "symbol": "BLL",
      "name": "Ball Corporation"
  },
  {
      "symbol": "BLMT",
      "name": "BSB Bancorp, Inc."
  },
  {
      "symbol": "BLOX",
      "name": "Infoblox Inc."
  },
  {
      "symbol": "BLRX",
      "name": "BioLineRx Ltd."
  },
  {
      "symbol": "BLT",
      "name": "Blount International, Inc."
  },
  {
      "symbol": "BLTI",
      "name": "BioLase Technology, Inc."
  },
  {
      "symbol": "BLW",
      "name": "Citigroup Inc."
  },
  {
      "symbol": "BLX",
      "name": "Banco Latinoamericano de Comercio Exterior, S.A."
  },
  {
      "symbol": "BMA",
      "name": "Banco Macro S.A."
  },
  {
      "symbol": "BMC",
      "name": "BMC Software, Inc."
  },
  {
      "symbol": "BME",
      "name": "Blackrock Health Sciences Trust"
  },
  {
      "symbol": "BMI",
      "name": "Badger Meter, Inc."
  },
  {
      "symbol": "BMJ",
      "name": "Birks & Mayors Inc."
  },
  {
      "symbol": "BML^G",
      "name": "Bank of America Corporation"
  },
  {
      "symbol": "BML^H",
      "name": "Bank of America Corporation"
  },
  {
      "symbol": "BML^I",
      "name": "Bank of America Corporation"
  },
  {
      "symbol": "BML^J",
      "name": "Bank of America Corporation"
  },
  {
      "symbol": "BML^L",
      "name": "Bank of America Corporation"
  },
  {
      "symbol": "BML^N",
      "name": "Bank of America Corporation"
  },
  {
      "symbol": "BML^O",
      "name": "Bank of America Corporation"
  },
  {
      "symbol": "BML^Q",
      "name": "Bank of America Corporation"
  },
  {
      "symbol": "BMO",
      "name": "Bank Of Montreal"
  },
  {
      "symbol": "BMR",
      "name": "Biomed Realty Trust"
  },
  {
      "symbol": "BMR^A",
      "name": "Biomed Realty Trust"
  },
  {
      "symbol": "BMRC",
      "name": "Bank of Marin Bancorp"
  },
  {
      "symbol": "BMRN",
      "name": "BioMarin Pharmaceutical Inc."
  },
  {
      "symbol": "BMS",
      "name": "Bemis Company, Inc."
  },
  {
      "symbol": "BMTC",
      "name": "Bryn Mawr Bank Corporation"
  },
  {
      "symbol": "BMTI",
      "name": "BioMimetic Therapeutics, Inc."
  },
  {
      "symbol": "BMY",
      "name": "Bristol-Myers Squibb Company"
  },
  {
      "symbol": "BMY^",
      "name": "Bristol-Myers Squibb Company"
  },
  {
      "symbol": "BNA",
      "name": "BlackRock Income Opportunity Trust Inc. (The)"
  },
  {
      "symbol": "BNCL",
      "name": "Beneficial Mutual Bancorp, Inc."
  },
  {
      "symbol": "BNCN",
      "name": "BNC Bancorp"
  },
  {
      "symbol": "BNHN",
      "name": "Benihana Inc."
  },
  {
      "symbol": "BNJ",
      "name": "BlackRock New Jersey Municipal Income Trust"
  },
  {
      "symbol": "BNNY",
      "name": "Annie&#39;s, Inc."
  },
  {
      "symbol": "BNS",
      "name": "Bank of Nova Scotia (The)"
  },
  {
      "symbol": "BNSO",
      "name": "Bonso Electronics International, Inc."
  },
  {
      "symbol": "BNY",
      "name": "BlackRock New York Investment Quality Municipal Trust Inc. (Th"
  },
  {
      "symbol": "BOBE",
      "name": "Bob Evans Farms, Inc."
  },
  {
      "symbol": "BOCH",
      "name": "Bank of Commerce Holdings (CA)"
  },
  {
      "symbol": "BODY",
      "name": "Body Central Corp."
  },
  {
      "symbol": "BOE",
      "name": "Blackrock Global"
  },
  {
      "symbol": "BOFI",
      "name": "BofI Holding, Inc."
  },
  {
      "symbol": "BOH",
      "name": "Bank of Hawaii Corporation"
  },
  {
      "symbol": "BOKF",
      "name": "BOK Financial Corporation"
  },
  {
      "symbol": "BOLT",
      "name": "Bolt Technology Corporation"
  },
  {
      "symbol": "BONA",
      "name": "Bona Film Group Limited"
  },
  {
      "symbol": "BONE",
      "name": "Bacterin International Holdings, Inc."
  },
  {
      "symbol": "BONT",
      "name": "The Bon-Ton Stores, Inc."
  },
  {
      "symbol": "BOOM",
      "name": "Dynamic Materials Corporation"
  },
  {
      "symbol": "BOOT",
      "name": "LaCrosse Footwear, Inc."
  },
  {
      "symbol": "BORN",
      "name": "China New Borun Corporation"
  },
  {
      "symbol": "BOSC",
      "name": "B.O.S. Better Online Solutions"
  },
  {
      "symbol": "BOTJ",
      "name": "Bank of the James Financial Group, Inc."
  },
  {
      "symbol": "BOVA",
      "name": "Bank Of Virginia"
  },
  {
      "symbol": "BOX",
      "name": "SeaCube Container Leasing Ltd."
  },
  {
      "symbol": "BOXC",
      "name": "Brookfield Canada Office Properties"
  },
  {
      "symbol": "BP",
      "name": "BP p.l.c."
  },
  {
      "symbol": "BPAX",
      "name": "Biosante Pharmaceuticals, Inc."
  },
  {
      "symbol": "BPFH",
      "name": "Boston Private Financial Holdings, Inc."
  },
  {
      "symbol": "BPFHW",
      "name": "Boston Private Financial Holdings, Inc."
  },
  {
      "symbol": "BPHX",
      "name": "BluePhoenix Solutions, Ltd."
  },
  {
      "symbol": "BPI",
      "name": "Bridgepoint Education"
  },
  {
      "symbol": "BPK",
      "name": "Blackrock Municipal 2018 Term Trust"
  },
  {
      "symbol": "BPL",
      "name": "Buckeye Partners L.P."
  },
  {
      "symbol": "BPO",
      "name": "Brookfield Office Properties Inc."
  },
  {
      "symbol": "BPOP",
      "name": "Popular, Inc."
  },
  {
      "symbol": "BPOPM",
      "name": "Popular, Inc."
  },
  {
      "symbol": "BPOPN",
      "name": "Popular, Inc."
  },
  {
      "symbol": "BPP",
      "name": "Blackrock Preferred Oopportunity Trust"
  },
  {
      "symbol": "BPS",
      "name": "BlackRock Pennsylvania Strategic Municipal Trust (The)"
  },
  {
      "symbol": "BPT",
      "name": "BP Prudhoe Bay Royalty Trust"
  },
  {
      "symbol": "BPZ",
      "name": "BPZ Resources, Inc"
  },
  {
      "symbol": "BQH",
      "name": "Blackrock New York Municipal Bond Trust"
  },
  {
      "symbol": "BQI",
      "name": "Oilsands Quest Inc"
  },
  {
      "symbol": "BQR",
      "name": "BlackRock Ecosolutions Investment Trust"
  },
  {
      "symbol": "BQY",
      "name": "S&P Quality Rankings Glbl Equ Mngd Tr"
  },
  {
      "symbol": "BR",
      "name": "Broadridge Financial Solutions, Inc."
  },
  {
      "symbol": "BRC",
      "name": "Brady Corporation"
  },
  {
      "symbol": "BRCD",
      "name": "Brocade Communications Systems, Inc."
  },
  {
      "symbol": "BRCM",
      "name": "Broadcom Corporation"
  },
  {
      "symbol": "BRD",
      "name": "Apollo Gold Corporation"
  },
  {
      "symbol": "BRE",
      "name": "BRE Properties, Inc."
  },
  {
      "symbol": "BRE^D",
      "name": "BRE Properties, Inc."
  },
  {
      "symbol": "BREW",
      "name": "Craft Brew Alliance, Inc."
  },
  {
      "symbol": "BRFS",
      "name": "BRF-Brasil Foods S.A."
  },
  {
      "symbol": "BRID",
      "name": "Bridgford Foods Corporation"
  },
  {
      "symbol": "BRK/A",
      "name": "Berkshire Hathaway Inc."
  },
  {
      "symbol": "BRK/B",
      "name": "Berkshire Hathaway Inc."
  },
  {
      "symbol": "BRKL",
      "name": "Brookline Bancorp, Inc."
  },
  {
      "symbol": "BRKR",
      "name": "Bruker Corporation"
  },
  {
      "symbol": "BRKS",
      "name": "Brooks Automation, Inc."
  },
  {
      "symbol": "BRLI",
      "name": "Bio-Reference Laboratories, Inc."
  },
  {
      "symbol": "BRN",
      "name": "Barnwell Industries, Inc."
  },
  {
      "symbol": "BRO",
      "name": "Brown & Brown, Inc."
  },
  {
      "symbol": "BRP",
      "name": "Brookfield Residential Properties Inc."
  },
  {
      "symbol": "BRS",
      "name": "Bristow Group Inc"
  },
  {
      "symbol": "BRT",
      "name": "BRT Realty Trust"
  },
  {
      "symbol": "BRY",
      "name": "Berry Petroleum Company"
  },
  {
      "symbol": "BSAC",
      "name": "Banco Santiago, S.A."
  },
  {
      "symbol": "BSBR",
      "name": "Banco Santander Brasil SA"
  },
  {
      "symbol": "BSD",
      "name": "BlackRock Strategic Municipal Trust Inc. (The)"
  },
  {
      "symbol": "BSDM",
      "name": "BSD Medical Corporation"
  },
  {
      "symbol": "BSE",
      "name": "Blackrock New York Municipal Income Quality Trust"
  },
  {
      "symbol": "BSET",
      "name": "Bassett Furniture Industries, Incorporated"
  },
  {
      "symbol": "BSFT",
      "name": "BroadSoft, Inc."
  },
  {
      "symbol": "BSI",
      "name": "Alon Holdings - Blue Square Israel Ltd."
  },
  {
      "symbol": "BSL",
      "name": "Blackstone GSO Senior Floating Rate Term Fund"
  },
  {
      "symbol": "BSP",
      "name": "American Strategic Income Portfolio II"
  },
  {
      "symbol": "BSPM",
      "name": "Biostar Pharmaceuticals, Inc."
  },
  {
      "symbol": "BSQR",
      "name": "BSQUARE Corporation"
  },
  {
      "symbol": "BSRR",
      "name": "Sierra Bancorp"
  },
  {
      "symbol": "BSTC",
      "name": "BioSpecifics Technologies Corp"
  },
  {
      "symbol": "BSX",
      "name": "Boston Scientific Corporation"
  },
  {
      "symbol": "BT",
      "name": "BT Group plc"
  },
  {
      "symbol": "BTA",
      "name": "BlackRock Long-Term Municipal Advantage Trust"
  },
  {
      "symbol": "BTC",
      "name": "Community Bankers Trust Corporation."
  },
  {
      "symbol": "BTE",
      "name": "Baytex Energy Corp"
  },
  {
      "symbol": "BTF",
      "name": "Boulder Total Return Fund, Inc."
  },
  {
      "symbol": "BTFG",
      "name": "BancTrust Financial Group, Inc."
  },
  {
      "symbol": "BTH",
      "name": "Blyth, Inc."
  },
  {
      "symbol": "BTI",
      "name": "British American Tobacco  Industries, p.l.c."
  },
  {
      "symbol": "BTN",
      "name": "Ballantyne Strong, Inc"
  },
  {
      "symbol": "BTO",
      "name": "John Hancock Bank and Thrift Fund"
  },
  {
      "symbol": "BTU",
      "name": "Peabody Energy Corporation"
  },
  {
      "symbol": "BTUI",
      "name": "BTU International, Inc."
  },
  {
      "symbol": "BTX",
      "name": "BioTime, Inc."
  },
  {
      "symbol": "BTZ",
      "name": "Blackrock Preferred"
  },
  {
      "symbol": "BUD",
      "name": "Anheuser-Busch Inbev SA"
  },
  {
      "symbol": "BUI",
      "name": "BlackRock Utility and Infrastructure Trust"
  },
  {
      "symbol": "BUR",
      "name": "Burcon Nutrascience Corp"
  },
  {
      "symbol": "BUSE",
      "name": "First Busey Corporation"
  },
  {
      "symbol": "BV",
      "name": "Bazaarvoice, Inc."
  },
  {
      "symbol": "BVN",
      "name": "Compania Mina Buenaventura, S.A."
  },
  {
      "symbol": "BVSN",
      "name": "BroadVision, Inc."
  },
  {
      "symbol": "BVX",
      "name": "Bovie Medical Corporation"
  },
  {
      "symbol": "BWA",
      "name": "BorgWarner Inc."
  },
  {
      "symbol": "BWC",
      "name": "Babcock & Wilcox Company (The)"
  },
  {
      "symbol": "BWEN",
      "name": "Broadwind Energy, Inc."
  },
  {
      "symbol": "BWF",
      "name": "Wells Fargo & Company"
  },
  {
      "symbol": "BWG",
      "name": "Legg Mason BW Global Income Opportunities Fund Inc."
  },
  {
      "symbol": "BWINA",
      "name": "Baldwin & Lyons, Inc."
  },
  {
      "symbol": "BWINB",
      "name": "Baldwin & Lyons, Inc."
  },
  {
      "symbol": "BWL/A",
      "name": "Bowl America, Inc."
  },
  {
      "symbol": "BWLD",
      "name": "Buffalo Wild Wings, Inc."
  },
  {
      "symbol": "BWOW",
      "name": "Wowjoint Holdings Limited"
  },
  {
      "symbol": "BWOWU",
      "name": "Wowjoint Holdings Limited"
  },
  {
      "symbol": "BWOWW",
      "name": "Wowjoint Holdings Limited"
  },
  {
      "symbol": "BWP",
      "name": "Boardwalk Pipeline Partners L.P."
  },
  {
      "symbol": "BWS",
      "name": "Brown Shoe Company, Inc."
  },
  {
      "symbol": "BX",
      "name": "The Blackstone Group L.P."
  },
  {
      "symbol": "BXC",
      "name": "BlueLinx Holdings Inc."
  },
  {
      "symbol": "BXG",
      "name": "Bluegreen Corporation"
  },
  {
      "symbol": "BXP",
      "name": "Boston Properties, Inc."
  },
  {
      "symbol": "BXS",
      "name": "BancorpSouth, Inc."
  },
  {
      "symbol": "BXS^A",
      "name": "BancorpSouth, Inc."
  },
  {
      "symbol": "BYD",
      "name": "Boyd Gaming Corporation"
  },
  {
      "symbol": "BYFC",
      "name": "Broadway Financial Corporation"
  },
  {
      "symbol": "BYI",
      "name": "Bally Technologies, Inc."
  },
  {
      "symbol": "BYM",
      "name": "Blackrock Municipal Income Quality Trust"
  },
  {
      "symbol": "BZ",
      "name": "Boise Inc"
  },
  {
      "symbol": "BZC",
      "name": "Breeze-Eastern Corporation"
  },
  {
      "symbol": "BZH",
      "name": "Beazer Homes USA, Inc."
  },
  {
      "symbol": "BZM",
      "name": "BlackRock Maryland Municipal Bond Trust"
  },
  {
      "symbol": "BZMD",
      "name": "Beazer Homes USA, Inc."
  },
  {
      "symbol": "BZU",
      "name": "Beazer Homes USA, Inc."
  },
  {
      "symbol": "C",
      "name": "Citigroup Inc."
  },
  {
      "symbol": "C/WS/A",
      "name": "Citigroup Inc."
  },
  {
      "symbol": "C/WS/B",
      "name": "Citigroup Inc."
  },
  {
      "symbol": "C^E",
      "name": "Citigroup Inc."
  },
  {
      "symbol": "C^F",
      "name": "Citigroup Inc."
  },
  {
      "symbol": "C^G",
      "name": "Citigroup Inc."
  },
  {
      "symbol": "C^H",
      "name": "Citigroup Inc."
  },
  {
      "symbol": "C^I",
      "name": "Citigroup Inc."
  },
  {
      "symbol": "C^J",
      "name": "Citigroup Inc."
  },
  {
      "symbol": "C^M",
      "name": "Citigroup Inc."
  },
  {
      "symbol": "C^N",
      "name": "Citigroup Inc."
  },
  {
      "symbol": "C^O",
      "name": "Citigroup Inc."
  },
  {
      "symbol": "C^P",
      "name": "Citigroup Inc."
  },
  {
      "symbol": "C^Q",
      "name": "Citigroup Inc."
  },
  {
      "symbol": "C^R",
      "name": "Citigroup Inc."
  },
  {
      "symbol": "C^S",
      "name": "Citigroup Inc."
  },
  {
      "symbol": "C^U",
      "name": "Citigroup Inc."
  },
  {
      "symbol": "C^V",
      "name": "Citigroup Inc."
  },
  {
      "symbol": "C^W",
      "name": "Citigroup Inc."
  },
  {
      "symbol": "C^Z",
      "name": "Citigroup Inc."
  },
  {
      "symbol": "CA",
      "name": "CA Inc."
  },
  {
      "symbol": "CAAS",
      "name": "China Automotive Systems, Inc."
  },
  {
      "symbol": "CAB",
      "name": "Cabela&#39;s Inc"
  },
  {
      "symbol": "CAC",
      "name": "Camden National Corporation"
  },
  {
      "symbol": "CACB",
      "name": "Cascade Bancorp"
  },
  {
      "symbol": "CACC",
      "name": "Credit Acceptance Corporation"
  },
  {
      "symbol": "CACH",
      "name": "Cache, Inc."
  },
  {
      "symbol": "CACI",
      "name": "CACI International, Inc."
  },
  {
      "symbol": "CADC",
      "name": "China Advanced Construction Materials Group, Inc."
  },
  {
      "symbol": "CADX",
      "name": "Cadence Pharmaceuticals, Inc."
  },
  {
      "symbol": "CAE",
      "name": "CAE Inc"
  },
  {
      "symbol": "CAF",
      "name": "Morgan Stanley China A Share Fund Inc."
  },
  {
      "symbol": "CAFI",
      "name": "Camco Financial Corporation"
  },
  {
      "symbol": "CAG",
      "name": "ConAgra Foods, Inc."
  },
  {
      "symbol": "CAH",
      "name": "Cardinal Health, Inc."
  },
  {
      "symbol": "CAJ",
      "name": "Canon, Inc."
  },
  {
      "symbol": "CAK",
      "name": "CAMAC Energy Inc."
  },
  {
      "symbol": "CAKE",
      "name": "The Cheesecake Factory Incorporated"
  },
  {
      "symbol": "CALD",
      "name": "Callidus Software, Inc."
  },
  {
      "symbol": "CALI",
      "name": "China Auto Logistics Inc."
  },
  {
      "symbol": "CALL",
      "name": "magicJack VocalTec Ltd"
  },
  {
      "symbol": "CALM",
      "name": "Cal-Maine Foods, Inc."
  },
  {
      "symbol": "CALX",
      "name": "Calix, Inc"
  },
  {
      "symbol": "CAM",
      "name": "Cameron International Corporation"
  },
  {
      "symbol": "CAMP",
      "name": "CalAmp Corp."
  },
  {
      "symbol": "CAMT",
      "name": "Camtek Ltd."
  },
  {
      "symbol": "CAP",
      "name": "Cai International, Inc."
  },
  {
      "symbol": "CAR",
      "name": "Avis Budget Group, Inc."
  },
  {
      "symbol": "CARB",
      "name": "Carbonite, Inc."
  },
  {
      "symbol": "CART",
      "name": "Carolina Trust Bank"
  },
  {
      "symbol": "CARV",
      "name": "Carver Bancorp, Inc."
  },
  {
      "symbol": "CARZ",
      "name": "First Trust Exchange-Traded Fund II First Trust NASDAQ Global "
  },
  {
      "symbol": "CAS",
      "name": "Castle (A.M.) & Co."
  },
  {
      "symbol": "CASC",
      "name": "Cascade Corporation"
  },
  {
      "symbol": "CASH",
      "name": "Meta Financial Group, Inc."
  },
  {
      "symbol": "CASM",
      "name": "CAS Medical Systems, Inc."
  },
  {
      "symbol": "CASS",
      "name": "Cass Information Systems, Inc"
  },
  {
      "symbol": "CAST",
      "name": "ChinaCast Education Corporation"
  },
  {
      "symbol": "CASY",
      "name": "Caseys General Stores, Inc."
  },
  {
      "symbol": "CAT",
      "name": "Caterpillar, Inc."
  },
  {
      "symbol": "CATM",
      "name": "Cardtronics, Inc."
  },
  {
      "symbol": "CATO",
      "name": "Cato Corporation (The)"
  },
  {
      "symbol": "CATY",
      "name": "Cathay General Bancorp"
  },
  {
      "symbol": "CAVM",
      "name": "Cavium, Inc."
  },
  {
      "symbol": "CAW",
      "name": "CCA Industries, Inc."
  },
  {
      "symbol": "CAZA",
      "name": "Cazador Acquisition Corporation Ltd."
  },
  {
      "symbol": "CAZAU",
      "name": "Cazador Acquisition Corporation Ltd."
  },
  {
      "symbol": "CAZAW",
      "name": "Cazador Acquisition Corporation Ltd."
  },
  {
      "symbol": "CB",
      "name": "Chubb Corporation (The)"
  },
  {
      "symbol": "CBAK",
      "name": "China BAK Battery, Inc."
  },
  {
      "symbol": "CBAN",
      "name": "Colony Bankcorp, Inc."
  },
  {
      "symbol": "CBB",
      "name": "Cincinnati Bell Inc"
  },
  {
      "symbol": "CBB^B",
      "name": "Cincinnati Bell Inc"
  },
  {
      "symbol": "CBD",
      "name": "Companhia Brasileira de Distribuicao"
  },
  {
      "symbol": "CBE",
      "name": "Cooper Industries, plc."
  },
  {
      "symbol": "CBEY",
      "name": "Cbeyond, Inc."
  },
  {
      "symbol": "CBG",
      "name": "CBRE Group, Inc."
  },
  {
      "symbol": "CBI",
      "name": "Chicago Bridge & Iron Company N.V."
  },
  {
      "symbol": "CBIN",
      "name": "Community Bank Shares of Indiana, Inc."
  },
  {
      "symbol": "CBK",
      "name": "Christopher & Banks Corporation"
  },
  {
      "symbol": "CBKN",
      "name": "Capital Bank Corporation"
  },
  {
      "symbol": "CBL",
      "name": "CBL & Associates Properties, Inc."
  },
  {
      "symbol": "CBL^C",
      "name": "CBL & Associates Properties, Inc."
  },
  {
      "symbol": "CBL^D",
      "name": "CBL & Associates Properties, Inc."
  },
  {
      "symbol": "CBLI",
      "name": "Cleveland BioLabs, Inc."
  },
  {
      "symbol": "CBM",
      "name": "Cambrex Corporation"
  },
  {
      "symbol": "CBMX",
      "name": "CombiMatrix Corporation"
  },
  {
      "symbol": "CBMXW",
      "name": "CombiMatrix Corporation"
  },
  {
      "symbol": "CBNJ",
      "name": "Cape Bancorp, Inc."
  },
  {
      "symbol": "CBNK",
      "name": "Chicopee Bancorp, Inc."
  },
  {
      "symbol": "CBO",
      "name": "CBO (Listing Market - NYSE - Networks A/E)"
  },
  {
      "symbol": "CBOE",
      "name": "CBOE Holdings, Inc."
  },
  {
      "symbol": "CBOU",
      "name": "Caribou Coffee Company, Inc."
  },
  {
      "symbol": "CBP",
      "name": "China Botanic Pharmaceutical Inc."
  },
  {
      "symbol": "CBPO",
      "name": "China Biologic Products, Inc."
  },
  {
      "symbol": "CBR",
      "name": "Ciber, Inc."
  },
  {
      "symbol": "CBRL",
      "name": "Cracker Barrel Old Country Store, Inc."
  },
  {
      "symbol": "CBRX",
      "name": "Columbia Laboratories, Inc."
  },
  {
      "symbol": "CBS",
      "name": "CBS Corporation"
  },
  {
      "symbol": "CBS/A",
      "name": "CBS Corporation"
  },
  {
      "symbol": "CBSH",
      "name": "Commerce Bancshares, Inc."
  },
  {
      "symbol": "CBST",
      "name": "Cubist Pharmaceuticals, Inc."
  },
  {
      "symbol": "CBT",
      "name": "Cabot Corporation"
  },
  {
      "symbol": "CBU",
      "name": "Community Bank System, Inc."
  },
  {
      "symbol": "CBX",
      "name": "CBX (Listing Market NYSE Networks AE"
  },
  {
      "symbol": "CBZ",
      "name": "CBIZ, Inc."
  },
  {
      "symbol": "CCA",
      "name": "MFS California Insured Municipal Trust"
  },
  {
      "symbol": "CCBG",
      "name": "Capital City Bank Group"
  },
  {
      "symbol": "CCC",
      "name": "Calgon Carbon Corporation"
  },
  {
      "symbol": "CCCL",
      "name": "China Ceramics Co., Ltd."
  },
  {
      "symbol": "CCCLU",
      "name": "China Ceramics Co., Ltd."
  },
  {
      "symbol": "CCCLW",
      "name": "China Ceramics Co., Ltd."
  },
  {
      "symbol": "CCE",
      "name": "Coca-Cola Enterprises, Inc."
  },
  {
      "symbol": "CCF",
      "name": "Chase Corporation"
  },
  {
      "symbol": "CCG",
      "name": "Campus Crest Communities, Inc."
  },
  {
      "symbol": "CCG^A",
      "name": "Campus Crest Communities, Inc."
  },
  {
      "symbol": "CCH",
      "name": "COCA COLA HELLENIC BOTTLING CO"
  },
  {
      "symbol": "CCI",
      "name": "Crown Castle International Corporation"
  },
  {
      "symbol": "CCIH",
      "name": "ChinaCache International Holdings Ltd."
  },
  {
      "symbol": "CCIX",
      "name": "Coleman Cable, Inc."
  },
  {
      "symbol": "CCJ",
      "name": "Cameco Corporation"
  },
  {
      "symbol": "CCK",
      "name": "Crown Cork & Seal Company, Inc."
  },
  {
      "symbol": "CCL",
      "name": "Carnival Corporation"
  },
  {
      "symbol": "CCM",
      "name": "Concord Medical Services Holdings Limited"
  },
  {
      "symbol": "CCMP",
      "name": "Cabot Microelectronics Corporation"
  },
  {
      "symbol": "CCNE",
      "name": "CNB Financial Corporation"
  },
  {
      "symbol": "CCO",
      "name": "Clear Channel Outdoor Holdings, Inc."
  },
  {
      "symbol": "CCOI",
      "name": "Cogent Communications Group, Inc."
  },
  {
      "symbol": "CCRN",
      "name": "Cross Country Healthcare, Inc."
  },
  {
      "symbol": "CCRT",
      "name": "CompuCredit Holdings Corporation"
  },
  {
      "symbol": "CCS",
      "name": "Comcast Corporation"
  },
  {
      "symbol": "CCSC",
      "name": "Country Style Cooking"
  },
  {
      "symbol": "CCU",
      "name": "Compania Cervecerias Unidas, S.A."
  },
  {
      "symbol": "CCUR",
      "name": "Concurrent Computer Corporation"
  },
  {
      "symbol": "CCXI",
      "name": "ChemoCentryx, Inc."
  },
  {
      "symbol": "CCZ",
      "name": "Comcast Corporation"
  },
  {
      "symbol": "CDE",
      "name": "Coeur d&#39;Alene Mines Corporation"
  },
  {
      "symbol": "CDI",
      "name": "CDI Corporation"
  },
  {
      "symbol": "CDII",
      "name": "CD International Enterprises, Inc."
  },
  {
      "symbol": "CDNS",
      "name": "Cadence Design Systems, Inc."
  },
  {
      "symbol": "CDR",
      "name": "Cedar Realty Trust, Inc."
  },
  {
      "symbol": "CDR^A",
      "name": "Cedar Realty Trust, Inc."
  },
  {
      "symbol": "CDTI",
      "name": "Clean Diesel Technologies, Inc."
  },
  {
      "symbol": "CDXS",
      "name": "Codexis, Inc."
  },
  {
      "symbol": "CDY",
      "name": "Cardero Resource Corporation"
  },
  {
      "symbol": "CDZI",
      "name": "Cadiz, Inc."
  },
  {
      "symbol": "CE",
      "name": "Celanese Corporation"
  },
  {
      "symbol": "CEA",
      "name": "China Eastern Airlines Corporation Ltd."
  },
  {
      "symbol": "CEBK",
      "name": "Central Bancorp, Inc"
  },
  {
      "symbol": "CEC",
      "name": "CEC Entertainment, Inc."
  },
  {
      "symbol": "CECE",
      "name": "CECO Environmental Corp."
  },
  {
      "symbol": "CECO",
      "name": "Career Education Corporation"
  },
  {
      "symbol": "CEDC",
      "name": "Central European Distribution Corporation"
  },
  {
      "symbol": "CEDU",
      "name": "ChinaEdu Corporation"
  },
  {
      "symbol": "CEE",
      "name": "Central Europe and Russia Fund, Inc. (The)"
  },
  {
      "symbol": "CEF",
      "name": "Central Fund of Canada Limited"
  },
  {
      "symbol": "CEG^A",
      "name": "Constellation Energy Group, Inc."
  },
  {
      "symbol": "CEL",
      "name": "Cellcom Israel, Ltd."
  },
  {
      "symbol": "CELG",
      "name": "Celgene Corporation"
  },
  {
      "symbol": "CELGZ",
      "name": "Celgene Corporation"
  },
  {
      "symbol": "CELL",
      "name": "Brightpoint, Inc."
  },
  {
      "symbol": "CEM",
      "name": "ClearBridge Energy MLP Fund Inc."
  },
  {
      "symbol": "CEMP",
      "name": "Cempra, Inc."
  },
  {
      "symbol": "CENT",
      "name": "Central Garden & Pet Company"
  },
  {
      "symbol": "CENTA",
      "name": "Central Garden & Pet Company"
  },
  {
      "symbol": "CENX",
      "name": "Century Aluminum Company"
  },
  {
      "symbol": "CEO",
      "name": "CNOOC Limited"
  },
  {
      "symbol": "CEP",
      "name": "Constellation Energy Partners, LLC"
  },
  {
      "symbol": "CERE",
      "name": "Ceres, Inc."
  },
  {
      "symbol": "CERN",
      "name": "Cerner Corporation"
  },
  {
      "symbol": "CERP",
      "name": "Cereplast, Inc."
  },
  {
      "symbol": "CERS",
      "name": "Cerus Corporation"
  },
  {
      "symbol": "CET",
      "name": "Central Securities Corporation"
  },
  {
      "symbol": "CETV",
      "name": "Central European Media Enterprises Ltd."
  },
  {
      "symbol": "CEV",
      "name": "Eaton Vance California Municipal Income Trust"
  },
  {
      "symbol": "CEVA",
      "name": "CEVA, Inc."
  },
  {
      "symbol": "CF",
      "name": "CF Industries Holdings, Inc."
  },
  {
      "symbol": "CFBK",
      "name": "Central Federal Corporation"
  },
  {
      "symbol": "CFC^A",
      "name": "Countrywide Financial Corporation"
  },
  {
      "symbol": "CFC^B",
      "name": "Countrywide Financial Corporation"
  },
  {
      "symbol": "CFD",
      "name": "Nuveen Diversified Commodity Fund"
  },
  {
      "symbol": "CFFC",
      "name": "Community Financial Corp."
  },
  {
      "symbol": "CFFI",
      "name": "C&F Financial Corporation"
  },
  {
      "symbol": "CFFN",
      "name": "Capitol Federal Financial, Inc."
  },
  {
      "symbol": "CFI",
      "name": "Culp, Inc."
  },
  {
      "symbol": "CFK",
      "name": "CE Franklin Ltd."
  },
  {
      "symbol": "CFN",
      "name": "CareFusion Corporation"
  },
  {
      "symbol": "CFNB",
      "name": "California First National Bancorp"
  },
  {
      "symbol": "CFNL",
      "name": "Cardinal Financial Corporation"
  },
  {
      "symbol": "CFP",
      "name": "Cornerstone Progressive Return Fund"
  },
  {
      "symbol": "CFR",
      "name": "Cullen/Frost Bankers, Inc."
  },
  {
      "symbol": "CFX",
      "name": "Colfax Corporation"
  },
  {
      "symbol": "CG",
      "name": "The Carlyle Group L.P."
  },
  {
      "symbol": "CGA",
      "name": "China Green Agriculture, Inc."
  },
  {
      "symbol": "CGEI",
      "name": "China Growth Equity Investment Ltd."
  },
  {
      "symbol": "CGEIU",
      "name": "China Growth Equity Investment Ltd."
  },
  {
      "symbol": "CGEIW",
      "name": "China Growth Equity Investment Ltd."
  },
  {
      "symbol": "CGEN",
      "name": "Compugen Ltd."
  },
  {
      "symbol": "CGI",
      "name": "Celadon Group, Inc."
  },
  {
      "symbol": "CGNX",
      "name": "Cognex Corporation"
  },
  {
      "symbol": "CGO",
      "name": "Calamos Global Total Return Fund"
  },
  {
      "symbol": "CGR",
      "name": "Claude Resources, Inc."
  },
  {
      "symbol": "CGV",
      "name": "Compagnie Generale de Geophysique-Veritas"
  },
  {
      "symbol": "CGX",
      "name": "Consolidated Graphics, Inc."
  },
  {
      "symbol": "CH",
      "name": "Aberdeen Chile Fund, Inc."
  },
  {
      "symbol": "CHA",
      "name": "China Telecom Corp Ltd"
  },
  {
      "symbol": "CHC",
      "name": "China Hydroelectric Corporation"
  },
  {
      "symbol": "CHC/WS",
      "name": "China Hydroelectric Corporation"
  },
  {
      "symbol": "CHCI",
      "name": "Comstock Homebuilding Companies, Inc."
  },
  {
      "symbol": "CHCO",
      "name": "City Holding Company"
  },
  {
      "symbol": "CHD",
      "name": "Church & Dwight Company, Inc."
  },
  {
      "symbol": "CHDN",
      "name": "Churchill Downs, Incorporated"
  },
  {
      "symbol": "CHDX",
      "name": "Chindex International, Inc."
  },
  {
      "symbol": "CHE",
      "name": "Chemed Corp."
  },
  {
      "symbol": "CHEF",
      "name": "The Chefs&#39; Warehouse, Inc."
  },
  {
      "symbol": "CHEV",
      "name": "Cheviot Financial Corp"
  },
  {
      "symbol": "CHFC",
      "name": "Chemical Financial Corporation"
  },
  {
      "symbol": "CHFN",
      "name": "Charter Financial Corp."
  },
  {
      "symbol": "CHG",
      "name": "CH Energy Group, Inc."
  },
  {
      "symbol": "CHGS",
      "name": "China GengSheng Minerals, Inc."
  },
  {
      "symbol": "CHH",
      "name": "Choice Hotels International, Inc."
  },
  {
      "symbol": "CHI",
      "name": "Calamos Convertible Opportunities and Income Fund"
  },
  {
      "symbol": "CHK",
      "name": "Chesapeake Energy Corporation"
  },
  {
      "symbol": "CHK^D",
      "name": "Chesapeake Energy Corporation"
  },
  {
      "symbol": "CHKE",
      "name": "Cherokee Inc."
  },
  {
      "symbol": "CHKM",
      "name": "Chesapeake Midstream Partmers, L.P."
  },
  {
      "symbol": "CHKP",
      "name": "Check Point Software Technologies Ltd."
  },
  {
      "symbol": "CHKR",
      "name": "Chesapeake Granite Wash Trust"
  },
  {
      "symbol": "CHL",
      "name": "China Mobile (Hong Kong) Ltd."
  },
  {
      "symbol": "CHLN",
      "name": "China Housing & Land Development, Inc."
  },
  {
      "symbol": "CHMP",
      "name": "Champion Industries, Inc."
  },
  {
      "symbol": "CHMT",
      "name": "Chemtura Corp."
  },
  {
      "symbol": "CHN",
      "name": "China Fund, Inc. (The)"
  },
  {
      "symbol": "CHNR",
      "name": "China Natural Resources, Inc."
  },
  {
      "symbol": "CHOP",
      "name": "China Gerui Advanced Materials Group Limited"
  },
  {
      "symbol": "CHRM",
      "name": "Charm Communications Inc."
  },
  {
      "symbol": "CHRS",
      "name": "Charming Shoppes, Inc."
  },
  {
      "symbol": "CHRW",
      "name": "C.H. Robinson Worldwide, Inc."
  },
  {
      "symbol": "CHS",
      "name": "Chico&#39;s FAS, Inc."
  },
  {
      "symbol": "CHSCP",
      "name": "CHS Inc"
  },
  {
      "symbol": "CHSI",
      "name": "Catalyst Health Solutions, Inc"
  },
  {
      "symbol": "CHSP",
      "name": "Chesapeake Lodging Trust"
  },
  {
      "symbol": "CHT",
      "name": "Chunghwa Telecom Co Ltd"
  },
  {
      "symbol": "CHTP",
      "name": "Chelsea Therapeutics International, Ltd."
  },
  {
      "symbol": "CHTR",
      "name": "Charter Communications, Inc."
  },
  {
      "symbol": "CHU",
      "name": "China Unicom (Hong Kong) Ltd"
  },
  {
      "symbol": "CHUX",
      "name": "O&#39;Charley&#39;s Inc."
  },
  {
      "symbol": "CHW",
      "name": "Calamos Global Dynamic Income Fund"
  },
  {
      "symbol": "CHY",
      "name": "Calamos Convertible and High Income Fund"
  },
  {
      "symbol": "CHYR",
      "name": "Chyron Corporation"
  },
  {
      "symbol": "CI",
      "name": "Cigna Corporation"
  },
  {
      "symbol": "CIA",
      "name": "Citizens, Inc."
  },
  {
      "symbol": "CIB",
      "name": "BanColombia S.A."
  },
  {
      "symbol": "CIDM",
      "name": "Cinedigm Digital Cinema Corp"
  },
  {
      "symbol": "CIE",
      "name": "Cobalt International Energy, Inc."
  },
  {
      "symbol": "CIEN",
      "name": "CIENA Corporation"
  },
  {
      "symbol": "CIF",
      "name": "Colonial Intermediate High Income Fund"
  },
  {
      "symbol": "CIG",
      "name": "Comp En De Mn Cemig ADS"
  },
  {
      "symbol": "CIG/C",
      "name": "Comp En De Mn Cemig ADS"
  },
  {
      "symbol": "CIGX",
      "name": "Star Scientific, Inc."
  },
  {
      "symbol": "CII",
      "name": "Blackrock Capital and Income Strategies Fund Inc"
  },
  {
      "symbol": "CIK",
      "name": "Credit Suisse Asset Management Income Fund, Inc."
  },
  {
      "symbol": "CIM",
      "name": "Chimera Investment Corporation"
  },
  {
      "symbol": "CIMT",
      "name": "Cimatron, Limited"
  },
  {
      "symbol": "CINF",
      "name": "Cincinnati Financial Corporation"
  },
  {
      "symbol": "CIR",
      "name": "CIRCOR International, Inc."
  },
  {
      "symbol": "CIS",
      "name": "Camelot Information Systems"
  },
  {
      "symbol": "CISG",
      "name": "CNinsure Inc."
  },
  {
      "symbol": "CIT",
      "name": "CIT Group Inc (DEL)"
  },
  {
      "symbol": "CITZ",
      "name": "CFS Bancorp, Inc."
  },
  {
      "symbol": "CIX",
      "name": "CompX International Inc."
  },
  {
      "symbol": "CIZN",
      "name": "Citizens Holding Company"
  },
  {
      "symbol": "CJES",
      "name": "C&J Energy Services, Inc."
  },
  {
      "symbol": "CJJD",
      "name": "China Jo-Jo Drugstores, Inc."
  },
  {
      "symbol": "CJS",
      "name": "Vale Cap Ltd"
  },
  {
      "symbol": "CJT",
      "name": "Vale Cap Ltd"
  },
  {
      "symbol": "CKEC",
      "name": "Carmike Cinemas, Inc."
  },
  {
      "symbol": "CKH",
      "name": "SEACOR Holdings, Inc."
  },
  {
      "symbol": "CKP",
      "name": "Checkpoint Systms, Inc."
  },
  {
      "symbol": "CKSW",
      "name": "ClickSoftware Technologies Ltd."
  },
  {
      "symbol": "CKX",
      "name": "CKX Lands, Inc."
  },
  {
      "symbol": "CL",
      "name": "Colgate-Palmolive Company"
  },
  {
      "symbol": "CLB",
      "name": "Core Laboratories N.V."
  },
  {
      "symbol": "CLBH",
      "name": "Carolina Bank Holdings Inc."
  },
  {
      "symbol": "CLC",
      "name": "CLARCOR Inc."
  },
  {
      "symbol": "CLCT",
      "name": "Collectors Universe, Inc."
  },
  {
      "symbol": "CLD",
      "name": "Cloud Peak Energy Inc"
  },
  {
      "symbol": "CLDT",
      "name": "Chatham Lodging Trust (REIT)"
  },
  {
      "symbol": "CLDX",
      "name": "Celldex Therapeutics, Inc."
  },
  {
      "symbol": "CLF",
      "name": "Cliffs Natural Resources Inc."
  },
  {
      "symbol": "CLFD",
      "name": "Clearfield, Inc."
  },
  {
      "symbol": "CLGX",
      "name": "CoreLogic, Inc."
  },
  {
      "symbol": "CLH",
      "name": "Clean Harbors, Inc."
  },
  {
      "symbol": "CLI",
      "name": "Mack-Cali Realty Corporation"
  },
  {
      "symbol": "CLIR",
      "name": "ClearSign Combustion Corporation"
  },
  {
      "symbol": "CLM",
      "name": "Cornerstone Strategic Value Fund, Inc."
  },
  {
      "symbol": "CLMS",
      "name": "Calamos Asset Management, Inc."
  },
  {
      "symbol": "CLMT",
      "name": "Calumet Specialty Products Partners, L.P."
  },
  {
      "symbol": "CLNE",
      "name": "Clean Energy Fuels Corp."
  },
  {
      "symbol": "CLNT",
      "name": "Cleantech Solutions International, Inc."
  },
  {
      "symbol": "CLNY",
      "name": "Colony Financial, Inc"
  },
  {
      "symbol": "CLNY^A",
      "name": "Colony Financial, Inc"
  },
  {
      "symbol": "CLP",
      "name": "Colonial Properties Trust"
  },
  {
      "symbol": "CLR",
      "name": "Continental Resources, Inc."
  },
  {
      "symbol": "CLRO",
      "name": "ClearOne Communications Inc."
  },
  {
      "symbol": "CLS",
      "name": "Celestica, Inc."
  },
  {
      "symbol": "CLSN",
      "name": "Celsion Corporation"
  },
  {
      "symbol": "CLUB",
      "name": "Town Sports International Holdings, Inc."
  },
  {
      "symbol": "CLVS",
      "name": "Clovis Oncology, Inc."
  },
  {
      "symbol": "CLW",
      "name": "Clearwater Paper Corporation"
  },
  {
      "symbol": "CLWR",
      "name": "Clearwire Corporation"
  },
  {
      "symbol": "CLWT",
      "name": "Euro Tech Holdings Company Limited"
  },
  {
      "symbol": "CLX",
      "name": "Clorox Company (The)"
  },
  {
      "symbol": "CM",
      "name": "Canadian Imperial Bank of Commerce"
  },
  {
      "symbol": "CMA",
      "name": "Comerica Incorporated"
  },
  {
      "symbol": "CMA/WS",
      "name": "Comerica Incorporated"
  },
  {
      "symbol": "CMC",
      "name": "Commercial Metals Company"
  },
  {
      "symbol": "CMCO",
      "name": "Columbus McKinnon Corporation"
  },
  {
      "symbol": "CMCSA",
      "name": "Comcast Corporation"
  },
  {
      "symbol": "CMCSK",
      "name": "Comcast Corporation"
  },
  {
      "symbol": "CME",
      "name": "CME Group Inc."
  },
  {
      "symbol": "CMFB",
      "name": "COMMERCEFIRST BANCORP INC"
  },
  {
      "symbol": "CMFO",
      "name": "China Marine Food Group Limited"
  },
  {
      "symbol": "CMG",
      "name": "Chipotle Mexican Grill, Inc."
  },
  {
      "symbol": "CMI",
      "name": "Cummins Inc."
  },
  {
      "symbol": "CMK",
      "name": "Colonial Intermarket Income Trust I"
  },
  {
      "symbol": "CMLP",
      "name": "Crestwood Midstream Partners LP"
  },
  {
      "symbol": "CMLS",
      "name": "Cumulus Media Inc."
  },
  {
      "symbol": "CMN",
      "name": "Cantel Medical Corp."
  },
  {
      "symbol": "CMO",
      "name": "Capstead Mortgage Corporation"
  },
  {
      "symbol": "CMO^A",
      "name": "Capstead Mortgage Corporation"
  },
  {
      "symbol": "CMO^B",
      "name": "Capstead Mortgage Corporation"
  },
  {
      "symbol": "CMP",
      "name": "Compass Minerals Intl Inc"
  },
  {
      "symbol": "CMRE",
      "name": "Costamare Inc."
  },
  {
      "symbol": "CMRG",
      "name": "Casual Male Retail Group, Inc."
  },
  {
      "symbol": "CMS",
      "name": "CMS Energy Corporation"
  },
  {
      "symbol": "CMS^A",
      "name": "CMS Energy Corporation"
  },
  {
      "symbol": "CMS^B",
      "name": "CMS Energy Corporation"
  },
  {
      "symbol": "CMSB",
      "name": "CMS Bancorp, Inc."
  },
  {
      "symbol": "CMT",
      "name": "Core Molding Technologies Inc"
  },
  {
      "symbol": "CMTL",
      "name": "Comtech Telecommunications Corp."
  },
  {
      "symbol": "CMU",
      "name": "Colonial Municipal Income Trust"
  },
  {
      "symbol": "CMVT",
      "name": "Comverse Technology, Inc."
  },
  {
      "symbol": "CNA",
      "name": "CNA Financial Corporation"
  },
  {
      "symbol": "CNAF",
      "name": "Commercial National Financial Corporation"
  },
  {
      "symbol": "CNAM",
      "name": "China Armco Metals, Inc."
  },
  {
      "symbol": "CNBC",
      "name": "Center Bancorp, Inc."
  },
  {
      "symbol": "CNBKA",
      "name": "Century Bancorp, Inc."
  },
  {
      "symbol": "CNC",
      "name": "Centene Corporation"
  },
  {
      "symbol": "CNDO",
      "name": "Coronado Biosciences, Inc."
  },
  {
      "symbol": "CNET",
      "name": "ChinaNet Online Holdings, Inc."
  },
  {
      "symbol": "CNGL",
      "name": "China Nutrifruit Group Limited"
  },
  {
      "symbol": "CNH",
      "name": "CNH Global N.V."
  },
  {
      "symbol": "CNI",
      "name": "Canadian National Railway Company"
  },
  {
      "symbol": "CNIT",
      "name": "China Information Technology, Inc."
  },
  {
      "symbol": "CNK",
      "name": "Cinemark Holdings Inc"
  },
  {
      "symbol": "CNL",
      "name": "Cleco Corporation"
  },
  {
      "symbol": "CNMD",
      "name": "CONMED Corporation"
  },
  {
      "symbol": "CNO",
      "name": "CNO Financial Group, Inc."
  },
  {
      "symbol": "CNP",
      "name": "CenterPoint Energy, Inc (Holding Co)"
  },
  {
      "symbol": "CNQ",
      "name": "Canadian Natural Resources Limited"
  },
  {
      "symbol": "CNQR",
      "name": "Concur Technologies, Inc."
  },
  {
      "symbol": "CNR",
      "name": "China Metro-Rural Holdings Limited"
  },
  {
      "symbol": "CNS",
      "name": "Cohn & Steers Inc"
  },
  {
      "symbol": "CNSL",
      "name": "Consolidated Communications Holdings, Inc."
  },
  {
      "symbol": "CNTF",
      "name": "China TechFaith Wireless Communication Technology Limited"
  },
  {
      "symbol": "CNTY",
      "name": "Century Casinos, Inc."
  },
  {
      "symbol": "CNVO",
      "name": "Convio, Inc."
  },
  {
      "symbol": "CNW",
      "name": "CNF, Inc."
  },
  {
      "symbol": "CNX",
      "name": "CONSOL Energy Inc."
  },
  {
      "symbol": "CNYD",
      "name": "China Yida Holding, Co."
  },
  {
      "symbol": "CO",
      "name": "China Cord Blood Corporation."
  },
  {
      "symbol": "COBK",
      "name": "Colonial Financial Services, Inc."
  },
  {
      "symbol": "COBR",
      "name": "Cobra Electronics Corporation"
  },
  {
      "symbol": "COBZ",
      "name": "CoBiz Financial Inc."
  },
  {
      "symbol": "COCO",
      "name": "Corinthian Colleges, Inc."
  },
  {
      "symbol": "CODE",
      "name": "Spansion Inc"
  },
  {
      "symbol": "CODI",
      "name": "Compass Diversified Holdings"
  },
  {
      "symbol": "COF",
      "name": "Capital One Financial Corporation"
  },
  {
      "symbol": "COF/WS",
      "name": "Capital One Financial Corporation"
  },
  {
      "symbol": "COF^B",
      "name": "Capital One Financial Corporation"
  },
  {
      "symbol": "COG",
      "name": "Cabot Oil & Gas Corporation"
  },
  {
      "symbol": "COGO",
      "name": "Cogo Group, Inc."
  },
  {
      "symbol": "COH",
      "name": "Coach, Inc."
  },
  {
      "symbol": "COHR",
      "name": "Coherent, Inc."
  },
  {
      "symbol": "COHU",
      "name": "Cohu, Inc."
  },
  {
      "symbol": "COKE",
      "name": "Coca-Cola Bottling Co. Consolidated"
  },
  {
      "symbol": "COL",
      "name": "Rockwell Collins, Inc."
  },
  {
      "symbol": "COLB",
      "name": "Columbia Banking System, Inc."
  },
  {
      "symbol": "COLM",
      "name": "Columbia Sportswear Company"
  },
  {
      "symbol": "COMV",
      "name": "Comverge, Inc."
  },
  {
      "symbol": "CONM",
      "name": "Conmed Healthcare Management, Inc."
  },
  {
      "symbol": "CONN",
      "name": "Conn&#39;s, Inc."
  },
  {
      "symbol": "COO",
      "name": "Cooper Companies, Inc. (The)"
  },
  {
      "symbol": "COOL",
      "name": "Majesco Entertainment Company"
  },
  {
      "symbol": "COP",
      "name": "ConocoPhillips"
  },
  {
      "symbol": "COR",
      "name": "CoreSite Realty Corporation"
  },
  {
      "symbol": "CORE",
      "name": "Core-Mark Holding Company, Inc."
  },
  {
      "symbol": "CORT",
      "name": "Corcept Therapeutics Incorporated"
  },
  {
      "symbol": "COSI",
      "name": "Cosi, Inc."
  },
  {
      "symbol": "COST",
      "name": "Costco Wholesale Corporation"
  },
  {
      "symbol": "COT",
      "name": "Cott Corporation"
  },
  {
      "symbol": "COV",
      "name": "Covidien plc."
  },
  {
      "symbol": "COVR",
      "name": "Cover-All Technologies Inc."
  },
  {
      "symbol": "COWN",
      "name": "Cowen Group, Inc."
  },
  {
      "symbol": "COY",
      "name": "Blackrock Corporate High Yield Fund, Inc."
  },
  {
      "symbol": "CP",
      "name": "Canadian Pacific Railway Limited"
  },
  {
      "symbol": "CPA",
      "name": "Copa Holdings, S.A."
  },
  {
      "symbol": "CPAC",
      "name": "Cementos Pacasmayo S.A.A."
  },
  {
      "symbol": "CPB",
      "name": "Campbell Soup Company"
  },
  {
      "symbol": "CPBC",
      "name": "Community Partners Bancorp"
  },
  {
      "symbol": "CPE",
      "name": "Callon Petroleum Company"
  },
  {
      "symbol": "CPF",
      "name": "CPB Inc."
  },
  {
      "symbol": "CPGI",
      "name": "China Shengda Packaging Group, Inc."
  },
  {
      "symbol": "CPHC",
      "name": "Canterbury Park Holding Corporation"
  },
  {
      "symbol": "CPHD",
      "name": "CEPHEID"
  },
  {
      "symbol": "CPHI",
      "name": "China Pharma Holdings, Inc."
  },
  {
      "symbol": "CPIX",
      "name": "Cumberland Pharmaceuticals Inc."
  },
  {
      "symbol": "CPK",
      "name": "Chesapeake Utilities Corporation"
  },
  {
      "symbol": "CPL",
      "name": "CPFL Energia S.A."
  },
  {
      "symbol": "CPLA",
      "name": "Capella Education Company"
  },
  {
      "symbol": "CPLP",
      "name": "Capital Product Partners L.P."
  },
  {
      "symbol": "CPN",
      "name": "Calpine Corporation"
  },
  {
      "symbol": "CPNO",
      "name": "Copano Energy, L.L.C."
  },
  {
      "symbol": "CPO",
      "name": "Corn Products International, Inc."
  },
  {
      "symbol": "CPP",
      "name": "Merrill Lynch Depositor, Inc."
  },
  {
      "symbol": "CPRT",
      "name": "Copart, Inc."
  },
  {
      "symbol": "CPRX",
      "name": "Catalyst Pharmaceutical Partners, Inc."
  },
  {
      "symbol": "CPSI",
      "name": "Computer Programs and Systems, Inc."
  },
  {
      "symbol": "CPSL",
      "name": "China Precision Steel, Inc."
  },
  {
      "symbol": "CPSS",
      "name": "Consumer Portfolio Services, Inc."
  },
  {
      "symbol": "CPST",
      "name": "Capstone Turbine Corporation"
  },
  {
      "symbol": "CPT",
      "name": "Camden Property Trust"
  },
  {
      "symbol": "CPTS",
      "name": "Conceptus, Inc."
  },
  {
      "symbol": "CPWM",
      "name": "Cost Plus, Inc."
  },
  {
      "symbol": "CPWR",
      "name": "Compuware Corporation"
  },
  {
      "symbol": "CQB",
      "name": "Chiquita Brands International, Inc."
  },
  {
      "symbol": "CQP",
      "name": "Cheniere Energy Partners, LP"
  },
  {
      "symbol": "CR",
      "name": "Crane Company"
  },
  {
      "symbol": "CRAI",
      "name": "CRA International,Inc."
  },
  {
      "symbol": "CRAY",
      "name": "Cray Inc"
  },
  {
      "symbol": "CRBC",
      "name": "Citizens Republic Bancorp, Inc."
  },
  {
      "symbol": "CRC",
      "name": "Chromcraft Revington, Inc."
  },
  {
      "symbol": "CRD/A",
      "name": "Crawford & Company"
  },
  {
      "symbol": "CRD/B",
      "name": "Crawford & Company"
  },
  {
      "symbol": "CRDC",
      "name": "Cardica, Inc."
  },
  {
      "symbol": "CRDN",
      "name": "Ceradyne, Inc."
  },
  {
      "symbol": "CRDS",
      "name": "Crossroads Systems, Inc."
  },
  {
      "symbol": "CRED",
      "name": "Credo Petroleum Corporation"
  },
  {
      "symbol": "CREE",
      "name": "Cree, Inc."
  },
  {
      "symbol": "CREG",
      "name": "China Recycling Energy Corporation"
  },
  {
      "symbol": "CRESW",
      "name": "Cresud S.A.C.I.F. y A."
  },
  {
      "symbol": "CRESY",
      "name": "Cresud S.A.C.I.F. y A."
  },
  {
      "symbol": "CRF",
      "name": "Cornerstone Strategic Return Fund, Inc. (The)"
  },
  {
      "symbol": "CRFN",
      "name": "Crescent Financial Bancshares, Inc."
  },
  {
      "symbol": "CRH",
      "name": "CRH PLC"
  },
  {
      "symbol": "CRI",
      "name": "Carter&#39;s, Inc."
  },
  {
      "symbol": "CRIS",
      "name": "Curis, Inc."
  },
  {
      "symbol": "CRK",
      "name": "Comstock Resources, Inc."
  },
  {
      "symbol": "CRL",
      "name": "Charles River Laboratories International, Inc."
  },
  {
      "symbol": "CRM",
      "name": "Salesforce.com Inc"
  },
  {
      "symbol": "CRMB",
      "name": "Crumbs Bake Shop, Inc."
  },
  {
      "symbol": "CRMBU",
      "name": "Crumbs Bake Shop, Inc."
  },
  {
      "symbol": "CRMBW",
      "name": "Crumbs Bake Shop, Inc."
  },
  {
      "symbol": "CRMD",
      "name": "CorMedix Inc"
  },
  {
      "symbol": "CRMD/WS",
      "name": "CorMedix Inc"
  },
  {
      "symbol": "CRME",
      "name": "Cardiome Pharma Corporation"
  },
  {
      "symbol": "CRMT",
      "name": "America&#39;s Car-Mart, Inc."
  },
  {
      "symbol": "CRNT",
      "name": "Ceragon Networks Ltd."
  },
  {
      "symbol": "CROX",
      "name": "Crocs, Inc."
  },
  {
      "symbol": "CRP",
      "name": "Credit Suisse Guernsey BRH"
  },
  {
      "symbol": "CRR",
      "name": "Carbo Ceramics, Inc."
  },
  {
      "symbol": "CRRB",
      "name": "Carrollton Bancorp"
  },
  {
      "symbol": "CRRC",
      "name": "Courier Corporation"
  },
  {
      "symbol": "CRS",
      "name": "Carpenter Technology Corporation"
  },
  {
      "symbol": "CRT",
      "name": "Cross Timbers Royalty Trust"
  },
  {
      "symbol": "CRTX",
      "name": "Cornerstone Therapeutics Inc."
  },
  {
      "symbol": "CRUS",
      "name": "Cirrus Logic, Inc."
  },
  {
      "symbol": "CRV",
      "name": "Coast Distribution System, Inc. (The)"
  },
  {
      "symbol": "CRVL",
      "name": "CorVel Corp."
  },
  {
      "symbol": "CRVP",
      "name": "Crystal Rock Holdings, Inc."
  },
  {
      "symbol": "CRWN",
      "name": "Crown Media Holdings, Inc."
  },
  {
      "symbol": "CRWS",
      "name": "Crown Crafts, Inc."
  },
  {
      "symbol": "CRY",
      "name": "CryoLife, Inc."
  },
  {
      "symbol": "CRYP",
      "name": "CryptoLogic Limited"
  },
  {
      "symbol": "CRZO",
      "name": "Carrizo Oil & Gas, Inc."
  },
  {
      "symbol": "CS",
      "name": "Credit Suisse Group"
  },
  {
      "symbol": "CSBC",
      "name": "Citizens South Banking Corporation"
  },
  {
      "symbol": "CSBK",
      "name": "Clifton Savings Bancorp, Inc."
  },
  {
      "symbol": "CSC",
      "name": "Computer Sciences Corporation"
  },
  {
      "symbol": "CSCD",
      "name": "Cascade Microtech, Inc."
  },
  {
      "symbol": "CSCO",
      "name": "Cisco Systems, Inc."
  },
  {
      "symbol": "CSE",
      "name": "CapitalSource Inc"
  },
  {
      "symbol": "CSFL",
      "name": "CenterState Banks, Inc."
  },
  {
      "symbol": "CSFS",
      "name": "The Cash Store Financial Services Inc."
  },
  {
      "symbol": "CSGP",
      "name": "CoStar Group, Inc."
  },
  {
      "symbol": "CSGS",
      "name": "CSG Systems International, Inc."
  },
  {
      "symbol": "CSH",
      "name": "Cash America International, Inc."
  },
  {
      "symbol": "CSI",
      "name": "Cutwater Select Income Fund"
  },
  {
      "symbol": "CSII",
      "name": "Cardiovascular Systems, Inc."
  },
  {
      "symbol": "CSIQ",
      "name": "Canadian Solar Inc."
  },
  {
      "symbol": "CSL",
      "name": "Carlisle Companies Incorporated"
  },
  {
      "symbol": "CSOD",
      "name": "Cornerstone OnDemand, Inc."
  },
  {
      "symbol": "CSP",
      "name": "American Strategic Income Portfolio III"
  },
  {
      "symbol": "CSPI",
      "name": "CSP Inc."
  },
  {
      "symbol": "CSQ",
      "name": "Calamos Strategic Total Return Fund"
  },
  {
      "symbol": "CSRE",
      "name": "CSR plc"
  },
  {
      "symbol": "CSS",
      "name": "CSS Industries, Inc."
  },
  {
      "symbol": "CSTE",
      "name": "CaesarStone Sdot-Yam Ltd."
  },
  {
      "symbol": "CSTR",
      "name": "Coinstar, Inc."
  },
  {
      "symbol": "CSU",
      "name": "Capital Senior Living Corporation"
  },
  {
      "symbol": "CSUN",
      "name": "China Sunergy Co., Ltd."
  },
  {
      "symbol": "CSV",
      "name": "Carriage Services, Inc."
  },
  {
      "symbol": "CSWC",
      "name": "Capital Southwest Corporation"
  },
  {
      "symbol": "CSX",
      "name": "CSX Corporation"
  },
  {
      "symbol": "CT",
      "name": "Capital Trust, Inc."
  },
  {
      "symbol": "CTAS",
      "name": "Cintas Corporation"
  },
  {
      "symbol": "CTB",
      "name": "Cooper Tire & Rubber Company"
  },
  {
      "symbol": "CTBI",
      "name": "Community Trust Bancorp, Inc."
  },
  {
      "symbol": "CTC",
      "name": "IFM Investments Limited"
  },
  {
      "symbol": "CTCH",
      "name": "Commtouch Software Ltd."
  },
  {
      "symbol": "CTCM",
      "name": "CTC Media, Inc."
  },
  {
      "symbol": "CTCT",
      "name": "Constant Contact, Inc."
  },
  {
      "symbol": "CTDC",
      "name": "China Technology Development Group Corporation"
  },
  {
      "symbol": "CTEL",
      "name": "City Telecom (H.K.) Limited"
  },
  {
      "symbol": "CTFO",
      "name": "China TransInfo Technology Corp."
  },
  {
      "symbol": "CTGX",
      "name": "Computer Task Group, Incorporated"
  },
  {
      "symbol": "CTHR",
      "name": "Charles & Colvard Ltd"
  },
  {
      "symbol": "CTIB",
      "name": "CTI Industries Corporation"
  },
  {
      "symbol": "CTIC",
      "name": "Cell Therapeutics, Inc."
  },
  {
      "symbol": "CTL",
      "name": "CenturyLink, Inc."
  },
  {
      "symbol": "CTO",
      "name": "Consolidated-Tomoka Land Co."
  },
  {
      "symbol": "CTP",
      "name": "CTPartners Executive Search Inc."
  },
  {
      "symbol": "CTQ",
      "name": "Qwest Corporation"
  },
  {
      "symbol": "CTRN",
      "name": "Citi Trends, Inc."
  },
  {
      "symbol": "CTRP",
      "name": "Ctrip.com International, Ltd."
  },
  {
      "symbol": "CTS",
      "name": "CTS Corporation"
  },
  {
      "symbol": "CTSH",
      "name": "Cognizant Technology Solutions Corporation"
  },
  {
      "symbol": "CTW",
      "name": "Qwest Corporation"
  },
  {
      "symbol": "CTWS",
      "name": "Connecticut Water Service, Inc."
  },
  {
      "symbol": "CTX",
      "name": "Qwest Corporation"
  },
  {
      "symbol": "CTXS",
      "name": "Citrix Systems, Inc."
  },
  {
      "symbol": "CTZ^A",
      "name": "Citizens Republic Bancorp, Inc."
  },
  {
      "symbol": "CU",
      "name": "First Trust Exchange-Traded Fund II First Trust ISE Global Cop"
  },
  {
      "symbol": "CUB",
      "name": "Cubic Corporation"
  },
  {
      "symbol": "CUBA",
      "name": "The Herzfeld Caribbean Basin Fund, Inc."
  },
  {
      "symbol": "CUBE",
      "name": "CubeSmart"
  },
  {
      "symbol": "CUBE^A",
      "name": "CubeSmart"
  },
  {
      "symbol": "CUI",
      "name": "CUI Global, Inc."
  },
  {
      "symbol": "CUK",
      "name": "Carnival Plc ADS"
  },
  {
      "symbol": "CUO",
      "name": "Continental Materials Corporation"
  },
  {
      "symbol": "CUR",
      "name": "Neuralstem, Inc."
  },
  {
      "symbol": "CUTR",
      "name": "Cutera, Inc."
  },
  {
      "symbol": "CUZ",
      "name": "Cousins Properties Incorporated"
  },
  {
      "symbol": "CUZ^A",
      "name": "Cousins Properties Incorporated"
  },
  {
      "symbol": "CUZ^B",
      "name": "Cousins Properties Incorporated"
  },
  {
      "symbol": "CV",
      "name": "Central Vermont Pub Svc"
  },
  {
      "symbol": "CVA",
      "name": "Covanta Holding Corporation"
  },
  {
      "symbol": "CVB",
      "name": "Lehman ABS Corporation"
  },
  {
      "symbol": "CVBF",
      "name": "CVB Financial Corporation"
  },
  {
      "symbol": "CVBK",
      "name": "Central Virginia Bankshares, Inc."
  },
  {
      "symbol": "CVC",
      "name": "Cablevision Systems Corporation"
  },
  {
      "symbol": "CVCO",
      "name": "Cavco Industries, Inc."
  },
  {
      "symbol": "CVCY",
      "name": "Central Valley Community Bancorp"
  },
  {
      "symbol": "CVD",
      "name": "Covance Inc."
  },
  {
      "symbol": "CVE",
      "name": "Cenovus Energy Inc"
  },
  {
      "symbol": "CVG",
      "name": "Convergys Corporation"
  },
  {
      "symbol": "CVGI",
      "name": "Commercial Vehicle Group, Inc."
  },
  {
      "symbol": "CVGW",
      "name": "Calavo Growers, Inc."
  },
  {
      "symbol": "CVH",
      "name": "Coventry Health Care, Inc."
  },
  {
      "symbol": "CVI",
      "name": "CVR Energy Inc."
  },
  {
      "symbol": "CVLT",
      "name": "CommVault Systems, Inc."
  },
  {
      "symbol": "CVLY",
      "name": "Codorus Valley Bancorp, Inc"
  },
  {
      "symbol": "CVM",
      "name": "Cel-Sci Corporation"
  },
  {
      "symbol": "CVO",
      "name": "Cenveo Inc"
  },
  {
      "symbol": "CVR",
      "name": "Chicago Rivet & Machine Co."
  },
  {
      "symbol": "CVS",
      "name": "CVS Corporation"
  },
  {
      "symbol": "CVTI",
      "name": "Covenant Transportation Group, Inc."
  },
  {
      "symbol": "CVU",
      "name": "CPI Aerostructures, Inc."
  },
  {
      "symbol": "CVV",
      "name": "CVD Equipment Corporation"
  },
  {
      "symbol": "CVVT",
      "name": "China Valves Technology, Inc."
  },
  {
      "symbol": "CVX",
      "name": "Chevron Corporation"
  },
  {
      "symbol": "CW",
      "name": "Curtiss-Wright Corporation"
  },
  {
      "symbol": "CWBC",
      "name": "Community West Bancshares"
  },
  {
      "symbol": "CWCO",
      "name": "Consolidated Water Co. Ltd."
  },
  {
      "symbol": "CWEI",
      "name": "Clayton Williams Energy, Inc."
  },
  {
      "symbol": "CWH",
      "name": "CommonWealth REIT"
  },
  {
      "symbol": "CWH^C",
      "name": "CommonWealth REIT"
  },
  {
      "symbol": "CWH^D",
      "name": "CommonWealth REIT"
  },
  {
      "symbol": "CWH^E",
      "name": "CommonWealth REIT"
  },
  {
      "symbol": "CWHN",
      "name": "CommonWealth REIT"
  },
  {
      "symbol": "CWST",
      "name": "Casella Waste Systems, Inc."
  },
  {
      "symbol": "CWT",
      "name": "California Water  Service Group Holding"
  },
  {
      "symbol": "CWTR",
      "name": "Coldwater Creek, Inc."
  },
  {
      "symbol": "CWZ",
      "name": "Lehman ABS Corporation"
  },
  {
      "symbol": "CX",
      "name": "Cemex S.A.B. de C.V."
  },
  {
      "symbol": "CXDC",
      "name": "China XD Plastics Company Limited"
  },
  {
      "symbol": "CXE",
      "name": "Colonial High Income Municipal Trust"
  },
  {
      "symbol": "CXH",
      "name": "Colonial Investment Grade Municipal Trust"
  },
  {
      "symbol": "CXM",
      "name": "Cardium Therapeutics, Inc."
  },
  {
      "symbol": "CXO",
      "name": "Concho Resources Inc."
  },
  {
      "symbol": "CXPO",
      "name": "Crimson Exploration Inc."
  },
  {
      "symbol": "CXS",
      "name": "Crexus Investment Corp."
  },
  {
      "symbol": "CXW",
      "name": "Corrections Corporation of America"
  },
  {
      "symbol": "CXZ",
      "name": "Crosshair Energy Corp"
  },
  {
      "symbol": "CY",
      "name": "Cypress Semiconductor Corporation"
  },
  {
      "symbol": "CYAN",
      "name": "Cyanotech Corporation"
  },
  {
      "symbol": "CYBE",
      "name": "CyberOptics Corporation"
  },
  {
      "symbol": "CYBI",
      "name": "Cybex International, Inc."
  },
  {
      "symbol": "CYBX",
      "name": "Cyberonics, Inc."
  },
  {
      "symbol": "CYCC",
      "name": "Cyclacel Pharmaceuticals, Inc."
  },
  {
      "symbol": "CYCCP",
      "name": "Cyclacel Pharmaceuticals, Inc."
  },
  {
      "symbol": "CYD",
      "name": "China Yuchai International Limited"
  },
  {
      "symbol": "CYE",
      "name": "Blackrock Corporate High Yield Fund III, Inc"
  },
  {
      "symbol": "CYH",
      "name": "Community Health Systems, Inc."
  },
  {
      "symbol": "CYMI",
      "name": "Cymer, Inc."
  },
  {
      "symbol": "CYN",
      "name": "City National Corporation"
  },
  {
      "symbol": "CYNO",
      "name": "Cynosure, Inc."
  },
  {
      "symbol": "CYOU",
      "name": "Changyou.com Limited"
  },
  {
      "symbol": "CYS",
      "name": "Cypress Sharpridge Investments Inc"
  },
  {
      "symbol": "CYT",
      "name": "Cytec Industries Inc."
  },
  {
      "symbol": "CYTK",
      "name": "Cytokinetics, Incorporated"
  },
  {
      "symbol": "CYTR",
      "name": "CytRx Corporation"
  },
  {
      "symbol": "CYTX",
      "name": "Cytori Therapeutics Inc"
  },
  {
      "symbol": "CYTXW",
      "name": "Cytori Therapeutics Inc"
  },
  {
      "symbol": "CZFC",
      "name": "Citizens First Corporation"
  },
  {
      "symbol": "CZNC",
      "name": "Citizens & Northern Corp"
  },
  {
      "symbol": "CZR",
      "name": "Caesars Entertainment Corporation"
  },
  {
      "symbol": "CZWI",
      "name": "Citizens Community Bancorp, Inc."
  },
  {
      "symbol": "CZZ",
      "name": "Cosan Limited"
  },
  {
      "symbol": "D",
      "name": "Dominion Resources, Inc."
  },
  {
      "symbol": "DAC",
      "name": "Danaos Corporation"
  },
  {
      "symbol": "DAEG",
      "name": "Daegis Inc"
  },
  {
      "symbol": "DAIO",
      "name": "Data I/O Corporation"
  },
  {
      "symbol": "DAKT",
      "name": "Daktronics, Inc."
  },
  {
      "symbol": "DAL",
      "name": "Delta Air Lines Inc. (New)"
  },
  {
      "symbol": "DAN",
      "name": "Dana Holding Corporation"
  },
  {
      "symbol": "DANG",
      "name": "E-Commerce China Dangdang Inc."
  },
  {
      "symbol": "DAR",
      "name": "Darling International Inc."
  },
  {
      "symbol": "DARA",
      "name": "DARA Biosciences, Inc."
  },
  {
      "symbol": "DATE",
      "name": "Jiayuan.com International Ltd."
  },
  {
      "symbol": "DAVE",
      "name": "Famous Dave&#39;s of America, Inc."
  },
  {
      "symbol": "DB",
      "name": "Deutsche Bank AG"
  },
  {
      "symbol": "DBD",
      "name": "Diebold, Incorporated"
  },
  {
      "symbol": "DBL",
      "name": "DoubleLine Opportunistic Credit Fund"
  },
  {
      "symbol": "DBLE",
      "name": "Double Eagle Petroleum Company"
  },
  {
      "symbol": "DBLEP",
      "name": "Double Eagle Petroleum Company"
  },
  {
      "symbol": "DCA",
      "name": "Virtus Total Return Fund"
  },
  {
      "symbol": "DCE",
      "name": "Deutsche Bk Cap Fdg Tr X"
  },
  {
      "symbol": "DCI",
      "name": "Donaldson Company, Inc."
  },
  {
      "symbol": "DCIN",
      "name": "Digital Cinema Destinations Corp."
  },
  {
      "symbol": "DCIX",
      "name": "Diana Containerships Inc."
  },
  {
      "symbol": "DCM",
      "name": "NTT DOCOMO, Inc"
  },
  {
      "symbol": "DCO",
      "name": "Ducommun Incorporated"
  },
  {
      "symbol": "DCOM",
      "name": "Dime Community Bancshares, Inc."
  },
  {
      "symbol": "DCT",
      "name": "DCT Industrial Trust Inc"
  },
  {
      "symbol": "DCTH",
      "name": "Delcath Systems, Inc."
  },
  {
      "symbol": "DD",
      "name": "E.I. du Pont de Nemours and Company"
  },
  {
      "symbol": "DD^A",
      "name": "E.I. du Pont de Nemours and Company"
  },
  {
      "symbol": "DD^B",
      "name": "E.I. du Pont de Nemours and Company"
  },
  {
      "symbol": "DDD",
      "name": "3D Systems Corporation"
  },
  {
      "symbol": "DDE",
      "name": "Dover Downs Gaming & Entertainment Inc"
  },
  {
      "symbol": "DDF",
      "name": "Delaware Investments Dividend & Income Fund, Inc."
  },
  {
      "symbol": "DDIC",
      "name": "DDi Corp."
  },
  {
      "symbol": "DDMG",
      "name": "Digital Domain Media Group, Inc."
  },
  {
      "symbol": "DDR",
      "name": "Developers Diversified Realty Corporation"
  },
  {
      "symbol": "DDR^H",
      "name": "Developers Diversified Realty Corporation"
  },
  {
      "symbol": "DDR^I",
      "name": "Developers Diversified Realty Corporation"
  },
  {
      "symbol": "DDS",
      "name": "Dillard&#39;s, Inc."
  },
  {
      "symbol": "DDT",
      "name": "Dillard&#39;s, Inc."
  },
  {
      "symbol": "DDZ^K",
      "name": "SiM Internal Test 3"
  },
  {
      "symbol": "DE",
      "name": "Deere & Company"
  },
  {
      "symbol": "DECK",
      "name": "Deckers Outdoor Corporation"
  },
  {
      "symbol": "DEER",
      "name": "Deer Consumer Products, Inc."
  },
  {
      "symbol": "DEG",
      "name": "Etablissements Delhaize Freres et Cie &quot;Le Lion&quot; S.A."
  },
  {
      "symbol": "DEI",
      "name": "Douglas Emmett, Inc."
  },
  {
      "symbol": "DEJ",
      "name": "Dejour Energy Inc."
  },
  {
      "symbol": "DEL",
      "name": "Deltic Timber Corporation"
  },
  {
      "symbol": "DELL",
      "name": "Dell Inc."
  },
  {
      "symbol": "DENN",
      "name": "Denny&#39;s Corporation"
  },
  {
      "symbol": "DEO",
      "name": "Diageo plc"
  },
  {
      "symbol": "DEPO",
      "name": "Depomed, Inc."
  },
  {
      "symbol": "DEST",
      "name": "Destination Maternity Corporation"
  },
  {
      "symbol": "DEX",
      "name": "Delaware Enhanced Global Dividend"
  },
  {
      "symbol": "DEXO",
      "name": "Dex One Corporation"
  },
  {
      "symbol": "DF",
      "name": "Dean Foods Company"
  },
  {
      "symbol": "DFG",
      "name": "Delphi Financial Group, Inc."
  },
  {
      "symbol": "DFP",
      "name": "Delphi Financial Group, Inc."
  },
  {
      "symbol": "DFR",
      "name": "CIFC Corp."
  },
  {
      "symbol": "DFS",
      "name": "Discover Financial Services"
  },
  {
      "symbol": "DFT",
      "name": "Dupont Fabros Technology, Inc."
  },
  {
      "symbol": "DFT^A",
      "name": "Dupont Fabros Technology, Inc."
  },
  {
      "symbol": "DFT^B",
      "name": "Dupont Fabros Technology, Inc."
  },
  {
      "symbol": "DFZ",
      "name": "R.G. Barry Corporation"
  },
  {
      "symbol": "DG",
      "name": "Dollar General Corporation"
  },
  {
      "symbol": "DGAS",
      "name": "Delta Natural Gas Company, Inc."
  },
  {
      "symbol": "DGI",
      "name": "DigitalGlobe, Inc"
  },
  {
      "symbol": "DGICA",
      "name": "Donegal Group, Inc."
  },
  {
      "symbol": "DGICB",
      "name": "Donegal Group, Inc."
  },
  {
      "symbol": "DGII",
      "name": "Digi International Inc."
  },
  {
      "symbol": "DGIT",
      "name": "Digital Generation, Inc."
  },
  {
      "symbol": "DGLY",
      "name": "Digital Ally, Inc."
  },
  {
      "symbol": "DGSE",
      "name": "DGSE Companies, Inc."
  },
  {
      "symbol": "DGX",
      "name": "Quest Diagnostics Incorporated"
  },
  {
      "symbol": "DHF",
      "name": "Dreyfus High Yield Strategies Fund"
  },
  {
      "symbol": "DHFT",
      "name": "Diamond Hill Financial Trends Fund, Inc."
  },
  {
      "symbol": "DHG",
      "name": "DWS High Income Opportunities Fund, Inc."
  },
  {
      "symbol": "DHI",
      "name": "D.R. Horton, Inc."
  },
  {
      "symbol": "DHIL",
      "name": "Diamond Hill Investment Group, Inc."
  },
  {
      "symbol": "DHR",
      "name": "Danaher Corporation"
  },
  {
      "symbol": "DHRM",
      "name": "Dehaier Medical Systems Limited"
  },
  {
      "symbol": "DHT",
      "name": "DHT Holdings, Inc."
  },
  {
      "symbol": "DHX",
      "name": "Dice Holdings, Inc."
  },
  {
      "symbol": "DHY",
      "name": "Credit Suisse High Yield Bond Fund"
  },
  {
      "symbol": "DIAL",
      "name": "Dial Global, Inc."
  },
  {
      "symbol": "DIN",
      "name": "DineEquity, Inc"
  },
  {
      "symbol": "DIOD",
      "name": "Diodes Incorporated"
  },
  {
      "symbol": "DIS",
      "name": "Walt Disney Company (The)"
  },
  {
      "symbol": "DISCA",
      "name": "Discovery Communications, Inc"
  },
  {
      "symbol": "DISCB",
      "name": "Discovery Communications, Inc"
  },
  {
      "symbol": "DISCK",
      "name": "Discovery Communications, Inc"
  },
  {
      "symbol": "DISH",
      "name": "DISH Network Corporation"
  },
  {
      "symbol": "DIT",
      "name": "AMCON Distributing Company"
  },
  {
      "symbol": "DITC",
      "name": "Ditech Networks, Inc."
  },
  {
      "symbol": "DJCO",
      "name": "Daily Journal Corp. (S.C.)"
  },
  {
      "symbol": "DK",
      "name": "Delek US Holdings, Inc."
  },
  {
      "symbol": "DKP",
      "name": "MS Structured Asset Corp Saturns GE Cap Corp Series 2002-14"
  },
  {
      "symbol": "DKS",
      "name": "Dick&#39;s Sporting Goods Inc"
  },
  {
      "symbol": "DKT",
      "name": "Deutsch Bk Contingent Cap Tr V"
  },
  {
      "symbol": "DL",
      "name": "China Distance Education Holdings Limited"
  },
  {
      "symbol": "DLA",
      "name": "Delta Apparel, Inc."
  },
  {
      "symbol": "DLB",
      "name": "Dolby Laboratories"
  },
  {
      "symbol": "DLGC",
      "name": "Dialogic, Inc."
  },
  {
      "symbol": "DLIA",
      "name": "dELIA*s Inc."
  },
  {
      "symbol": "DLLR",
      "name": "DFC Global Corp"
  },
  {
      "symbol": "DLPH",
      "name": "Delphi Automotive plc"
  },
  {
      "symbol": "DLR",
      "name": "Digital Realty Trust, Inc."
  },
  {
      "symbol": "DLR^E",
      "name": "Digital Realty Trust, Inc."
  },
  {
      "symbol": "DLR^F",
      "name": "Digital Realty Trust, Inc."
  },
  {
      "symbol": "DLTR",
      "name": "Dollar Tree, Inc."
  },
  {
      "symbol": "DLX",
      "name": "Deluxe Corporation"
  },
  {
      "symbol": "DM",
      "name": "Dolan Company (The)"
  },
  {
      "symbol": "DMD",
      "name": "Demand Media Inc."
  },
  {
      "symbol": "DMED",
      "name": "D. Medical Industries Ltd."
  },
  {
      "symbol": "DMF",
      "name": "Dreyfus Municipal Income, Inc."
  },
  {
      "symbol": "DMLP",
      "name": "Dorchester Minerals, L.P."
  },
  {
      "symbol": "DMND",
      "name": "Diamond Foods, Inc."
  },
  {
      "symbol": "DMO",
      "name": "Western Asset Mortgage Defined Opportunity Fund Inc"
  },
  {
      "symbol": "DMRC",
      "name": "Digimarc Corporation"
  },
  {
      "symbol": "DNB",
      "name": "Dun & Bradstreet Corporation (The)"
  },
  {
      "symbol": "DNBF",
      "name": "DNB Financial Corp"
  },
  {
      "symbol": "DNDN",
      "name": "Dendreon Corporation"
  },
  {
      "symbol": "DNI",
      "name": "Dividend and Income Fund, Inc."
  },
  {
      "symbol": "DNKN",
      "name": "Dunkin&#39; Brands Group, Inc."
  },
  {
      "symbol": "DNN",
      "name": "Intl Uranium Corp"
  },
  {
      "symbol": "DNP",
      "name": "Duff & Phelps Utilities Income, Inc."
  },
  {
      "symbol": "DNR",
      "name": "Denbury Resources, Inc. (Holding Company)"
  },
  {
      "symbol": "DNY",
      "name": "The Denali Fund"
  },
  {
      "symbol": "DO",
      "name": "Diamond Offshore Drilling, Inc."
  },
  {
      "symbol": "DOLE",
      "name": "Dole Food Company, Inc"
  },
  {
      "symbol": "DOM",
      "name": "Dominion Resources Black Warrior Trust"
  },
  {
      "symbol": "DORM",
      "name": "Dorman Products, Inc."
  },
  {
      "symbol": "DOV",
      "name": "Dover Corporation"
  },
  {
      "symbol": "DOVR",
      "name": "Dover Saddlery, Inc."
  },
  {
      "symbol": "DOW",
      "name": "Dow Chemical Company (The)"
  },
  {
      "symbol": "DOX",
      "name": "Amdocs Limited"
  },
  {
      "symbol": "DPD",
      "name": "Dow 30 Premium"
  },
  {
      "symbol": "DPG",
      "name": "Duff & Phelps Global Utility Income Fund Inc."
  },
  {
      "symbol": "DPM",
      "name": "DCP Midstream Partners, LP"
  },
  {
      "symbol": "DPO",
      "name": "Dow 30 Premium"
  },
  {
      "symbol": "DPS",
      "name": "Dr Pepper Snapple Group, Inc"
  },
  {
      "symbol": "DPW",
      "name": "Digital Power Corporation"
  },
  {
      "symbol": "DPZ",
      "name": "Domino&#39;s Pizza Inc"
  },
  {
      "symbol": "DQ",
      "name": "DAQQ New Energy Corp."
  },
  {
      "symbol": "DRAD",
      "name": "Digirad Corporation"
  },
  {
      "symbol": "DRAM",
      "name": "Dataram Corporation"
  },
  {
      "symbol": "DRC",
      "name": "Dresser-Rand Group Inc."
  },
  {
      "symbol": "DRCO",
      "name": "Dynamics Research Corporation"
  },
  {
      "symbol": "DRD",
      "name": "DRDGOLD Limited"
  },
  {
      "symbol": "DRE",
      "name": "Duke Realty Corporation"
  },
  {
      "symbol": "DRE^J",
      "name": "Duke Realty Corporation"
  },
  {
      "symbol": "DRE^K",
      "name": "Duke Realty Corporation"
  },
  {
      "symbol": "DRE^L",
      "name": "Duke Realty Corporation"
  },
  {
      "symbol": "DRE^O",
      "name": "Duke Realty Corporation"
  },
  {
      "symbol": "DRH",
      "name": "Diamondrock Hospitality Company"
  },
  {
      "symbol": "DRI",
      "name": "Darden Restaurants, Inc."
  },
  {
      "symbol": "DRIV",
      "name": "Digital River, Inc."
  },
  {
      "symbol": "DRJ",
      "name": "Dreams, Inc."
  },
  {
      "symbol": "DRL",
      "name": "Doral Financial Corporation"
  },
  {
      "symbol": "DRQ",
      "name": "Dril-Quip, Inc."
  },
  {
      "symbol": "DRRX",
      "name": "Durect Corporation"
  },
  {
      "symbol": "DRU",
      "name": "Dominion Resources, Inc."
  },
  {
      "symbol": "DRWI",
      "name": "DragonWave Inc"
  },
  {
      "symbol": "DRYS",
      "name": "DryShips Inc."
  },
  {
      "symbol": "DSCI",
      "name": "Derma Sciences, Inc."
  },
  {
      "symbol": "DSCO",
      "name": "Discovery Laboratories, Inc."
  },
  {
      "symbol": "DSGX",
      "name": "The Descartes Systems Group Inc."
  },
  {
      "symbol": "DSM",
      "name": "Dreyfus Strategic Municipal Bond Fund, Inc."
  },
  {
      "symbol": "DSPG",
      "name": "DSP Group, Inc."
  },
  {
      "symbol": "DSS",
      "name": "Document Security Systems, Inc."
  },
  {
      "symbol": "DST",
      "name": "DST Systems, Inc."
  },
  {
      "symbol": "DSTI",
      "name": "DayStar Technologies, Inc."
  },
  {
      "symbol": "DSU",
      "name": "Blackrock Debt Strategies Fund, Inc."
  },
  {
      "symbol": "DSW",
      "name": "DSW Inc."
  },
  {
      "symbol": "DSWL",
      "name": "Deswell Industries, Inc."
  },
  {
      "symbol": "DSX",
      "name": "Diana Shipping inc."
  },
  {
      "symbol": "DTE",
      "name": "DTE Energy Company"
  },
  {
      "symbol": "DTF",
      "name": "Duff & Phelps Utilities Tax-Free Income, Inc."
  },
  {
      "symbol": "DTG",
      "name": "Dollar Thrifty Automotive Group, Inc."
  },
  {
      "symbol": "DTK",
      "name": "Deutsche Bank AG"
  },
  {
      "symbol": "DTLK",
      "name": "Datalink Corporation"
  },
  {
      "symbol": "DTSI",
      "name": "DTS, Inc."
  },
  {
      "symbol": "DTT",
      "name": "Deutsche Bank AG"
  },
  {
      "symbol": "DTV",
      "name": "DIRECTV"
  },
  {
      "symbol": "DTZ",
      "name": "DTE Energy Company"
  },
  {
      "symbol": "DUA",
      "name": "Deutsche Bank AG"
  },
  {
      "symbol": "DUC",
      "name": "Duff & Phelps Utility & Corporate Bond Trust, Inc."
  },
  {
      "symbol": "DUCK",
      "name": "Duckwall-Alco Stores, Inc."
  },
  {
      "symbol": "DUF",
      "name": "Duff & Phelps Corporation"
  },
  {
      "symbol": "DUK",
      "name": "Duke Energy Corporation"
  },
  {
      "symbol": "DUSA",
      "name": "DUSA Pharmaceuticals, Inc."
  },
  {
      "symbol": "DV",
      "name": "DeVry Inc."
  },
  {
      "symbol": "DVA",
      "name": "DaVita Inc."
  },
  {
      "symbol": "DVAX",
      "name": "Dynavax Technologies Corporation"
  },
  {
      "symbol": "DVD",
      "name": "Dover Downs Entertainment, Inc."
  },
  {
      "symbol": "DVF",
      "name": "Blackrock Diversified Income Strategies Fund, Inc."
  },
  {
      "symbol": "DVM",
      "name": "Cohen & Steers Dividend Majors Fund"
  },
  {
      "symbol": "DVN",
      "name": "Devon Energy Corporation"
  },
  {
      "symbol": "DVOX",
      "name": "DynaVox Inc."
  },
  {
      "symbol": "DVR",
      "name": "Cal Dive International, Inc."
  },
  {
      "symbol": "DW",
      "name": "Drew Industries Incorporated"
  },
  {
      "symbol": "DWA",
      "name": "Dreamworks Animation SKG, Inc."
  },
  {
      "symbol": "DWCH",
      "name": "Datawatch Corporation"
  },
  {
      "symbol": "DWRE",
      "name": "DEMANDWARE, INC."
  },
  {
      "symbol": "DWSN",
      "name": "Dawson Geophysical Company"
  },
  {
      "symbol": "DX",
      "name": "Dynex Capital, Inc."
  },
  {
      "symbol": "DXB",
      "name": "Deutsche Bank AG"
  },
  {
      "symbol": "DXCM",
      "name": "DexCom, Inc."
  },
  {
      "symbol": "DXPE",
      "name": "DXP Enterprises, Inc."
  },
  {
      "symbol": "DXR",
      "name": "Daxor Corporation"
  },
  {
      "symbol": "DXYN",
      "name": "The Dixie Group, Inc."
  },
  {
      "symbol": "DY",
      "name": "Dycom Industries, Inc."
  },
  {
      "symbol": "DYAX",
      "name": "Dyax Corp."
  },
  {
      "symbol": "DYII",
      "name": "Dynacq Healthcare, Inc."
  },
  {
      "symbol": "DYN",
      "name": "Dynegy Inc."
  },
  {
      "symbol": "DYNT",
      "name": "Dynatronics Corporation"
  },
  {
      "symbol": "DYSL",
      "name": "Dynasil Corporation of America"
  },
  {
      "symbol": "E",
      "name": "ENI S.p.A."
  },
  {
      "symbol": "EA",
      "name": "Electronic Arts Inc."
  },
  {
      "symbol": "EAA",
      "name": "Entergy Arkansas, Inc."
  },
  {
      "symbol": "EAC           ",
      "name": "Erickson Air-Crane Incorporated"
  },
  {
      "symbol": "EAD",
      "name": "Wells Fargo Advantage Income Opportunities Fund"
  },
  {
      "symbol": "EAGL",
      "name": "Global Eagle Acquisition Corp."
  },
  {
      "symbol": "EAGLU",
      "name": "Global Eagle Acquisition Corp."
  },
  {
      "symbol": "EAGLW",
      "name": "Global Eagle Acquisition Corp."
  },
  {
      "symbol": "EAT",
      "name": "Brinker International, Inc."
  },
  {
      "symbol": "EBAY",
      "name": "eBay Inc."
  },
  {
      "symbol": "EBF",
      "name": "Ennis, Inc."
  },
  {
      "symbol": "EBIX",
      "name": "Ebix Inc"
  },
  {
      "symbol": "EBMT",
      "name": "Eagle Bancorp Montana, Inc."
  },
  {
      "symbol": "EBR",
      "name": "Centrais Elc Braz Pfb B Elbras"
  },
  {
      "symbol": "EBR/B",
      "name": "Centrais Elc Braz Pfb B Elbras"
  },
  {
      "symbol": "EBS",
      "name": "Emergent Biosolutions, Inc."
  },
  {
      "symbol": "EBSB",
      "name": "Meridian Interstate Bancorp, Inc."
  },
  {
      "symbol": "EBTC",
      "name": "Enterprise Bancorp Inc"
  },
  {
      "symbol": "EBTX",
      "name": "Encore Bancshares, Inc."
  },
  {
      "symbol": "EC",
      "name": "Ecopetrol S.A."
  },
  {
      "symbol": "ECA",
      "name": "Encana Corporation"
  },
  {
      "symbol": "ECBE",
      "name": "ECB Bancorp Inc"
  },
  {
      "symbol": "ECF",
      "name": "Ellsworth Convertible Growth and Income Fund, Inc."
  },
  {
      "symbol": "ECHO",
      "name": "Echo Global Logistics, Inc."
  },
  {
      "symbol": "ECL",
      "name": "Ecolab Inc."
  },
  {
      "symbol": "ECOL",
      "name": "US Ecology, Inc."
  },
  {
      "symbol": "ECPG",
      "name": "Encore Capital Group Inc"
  },
  {
      "symbol": "ECT",
      "name": "ECA Marcellus Trust I"
  },
  {
      "symbol": "ECTE",
      "name": "Echo Therapeutics, Inc."
  },
  {
      "symbol": "ECTY",
      "name": "Ecotality, Inc."
  },
  {
      "symbol": "ECYT",
      "name": "Endocyte, Inc."
  },
  {
      "symbol": "ED",
      "name": "Consolidated Edison Company of New York, Inc."
  },
  {
      "symbol": "EDAC",
      "name": "Edac Technologies Corporation"
  },
  {
      "symbol": "EDAP",
      "name": "EDAP TMS S.A."
  },
  {
      "symbol": "EDD",
      "name": "Morgan Stanley Emerging Markets Domestic Debt Fund, Inc."
  },
  {
      "symbol": "EDE",
      "name": "Empire District Electric Company (The)"
  },
  {
      "symbol": "EDF",
      "name": "Stone Harbor Emerging Markets Income Fund"
  },
  {
      "symbol": "EDG",
      "name": "Edgen Group Inc."
  },
  {
      "symbol": "EDGR",
      "name": "EDGAR Online, Inc."
  },
  {
      "symbol": "EDGW",
      "name": "Edgewater Technology, Inc."
  },
  {
      "symbol": "EDMC",
      "name": "Education Management Corporation"
  },
  {
      "symbol": "EDN",
      "name": "Empresa Distribuidora Y Comercializadora Norte S.A. (Edenor)"
  },
  {
      "symbol": "EDR",
      "name": "Education Realty Trust Inc."
  },
  {
      "symbol": "EDS",
      "name": "Exceed Company Ltd."
  },
  {
      "symbol": "EDT",
      "name": "Entergy Texas Inc"
  },
  {
      "symbol": "EDU",
      "name": "New Oriental Education & Technology Group, Inc."
  },
  {
      "symbol": "EDUC",
      "name": "Educational Development Corporation"
  },
  {
      "symbol": "EE",
      "name": "El Paso Electric Company"
  },
  {
      "symbol": "EEA",
      "name": "European Equity Fund, Inc. (The)"
  },
  {
      "symbol": "EEFT",
      "name": "Euronet Worldwide, Inc."
  },
  {
      "symbol": "EEI",
      "name": "Ecology and Environment, Inc."
  },
  {
      "symbol": "EEMA",
      "name": "iShares, Inc. iShares MSCI Emerging Markets Asia Index Fund"
  },
  {
      "symbol": "EEME",
      "name": "iShares, Inc. iShares MSCI Emerging Markets EMEA Index Fund"
  },
  {
      "symbol": "EEML",
      "name": "iShares Trust iShares MSCI Emerging Markets Latin America Inde"
  },
  {
      "symbol": "EEP",
      "name": "Enbridge Energy, L.P."
  },
  {
      "symbol": "EEQ",
      "name": "Enbridge Energy Management LLC"
  },
  {
      "symbol": "EF",
      "name": "Edelman Financial Group Inc. (The)"
  },
  {
      "symbol": "EFC",
      "name": "Ellington Financial LLC"
  },
  {
      "symbol": "EFII",
      "name": "Electronics for Imaging, Inc."
  },
  {
      "symbol": "EFM",
      "name": "Entergy Mississippi, Inc."
  },
  {
      "symbol": "EFR",
      "name": "Eaton Vance Senior Floating-Rate Fund"
  },
  {
      "symbol": "EFSC",
      "name": "Enterprise Financial Services Corporation"
  },
  {
      "symbol": "EFT",
      "name": "Eaton Vance Floating Rate Income Trust"
  },
  {
      "symbol": "EFUT",
      "name": "eFuture Information Technology Inc."
  },
  {
      "symbol": "EFX",
      "name": "Equifax, Inc."
  },
  {
      "symbol": "EGAN",
      "name": "eGain Communications Corporation"
  },
  {
      "symbol": "EGAS",
      "name": "Gas Natural Inc."
  },
  {
      "symbol": "EGBN",
      "name": "Eagle Bancorp, Inc."
  },
  {
      "symbol": "EGF",
      "name": "Blackrock Enhanced Government Fund, Inc"
  },
  {
      "symbol": "EGHT",
      "name": "8x8 Inc"
  },
  {
      "symbol": "EGI",
      "name": "Entree Gold Inc"
  },
  {
      "symbol": "EGLE",
      "name": "Eagle Bulk Shipping Inc."
  },
  {
      "symbol": "EGN",
      "name": "Energen Corporation"
  },
  {
      "symbol": "EGO",
      "name": "Eldorado Gold Corp"
  },
  {
      "symbol": "EGOV",
      "name": "NIC Inc."
  },
  {
      "symbol": "EGP",
      "name": "EastGroup Properties, Inc."
  },
  {
      "symbol": "EGRW",
      "name": "iShares, Inc. iShares MSCI Emerging Markets Growth Index Fund"
  },
  {
      "symbol": "EGT",
      "name": "Entertainment Gaming Asia Incorporated"
  },
  {
      "symbol": "EGX",
      "name": "Engex, Inc."
  },
  {
      "symbol": "EGY",
      "name": "Vaalco Energy Inc"
  },
  {
      "symbol": "EHI",
      "name": "Western Asset Global High Income Fund Inc"
  },
  {
      "symbol": "EHTH",
      "name": "eHealth, Inc."
  },
  {
      "symbol": "EIA",
      "name": "Eaton Vance California Municipal Bond Fund II"
  },
  {
      "symbol": "EIG",
      "name": "Employers Holdings Inc"
  },
  {
      "symbol": "EIHI",
      "name": "Eastern Insurance Holdings, Inc."
  },
  {
      "symbol": "EIM",
      "name": "Eaton Vance Municipal Bond Fund"
  },
  {
      "symbol": "EIO",
      "name": "Eaton Vance Ohio Municipal Bond Fund"
  },
  {
      "symbol": "EIP",
      "name": "Eaton Vance Pennsylvania Municipal Bond Fund"
  },
  {
      "symbol": "EIV",
      "name": "Eaton Vance Municipal Bond Fund II"
  },
  {
      "symbol": "EIX",
      "name": "Edison International"
  },
  {
      "symbol": "EJ",
      "name": "E-House (China) Holdings Limited"
  },
  {
      "symbol": "EL",
      "name": "Estee Lauder Companies, Inc. (The)"
  },
  {
      "symbol": "ELA",
      "name": "Entergy Louisiana, Inc."
  },
  {
      "symbol": "ELB",
      "name": "Entergy Louisiana, Inc."
  },
  {
      "symbol": "ELGX",
      "name": "Endologix  Inc"
  },
  {
      "symbol": "ELLI",
      "name": "Ellie Mae, Inc."
  },
  {
      "symbol": "ELLO",
      "name": "Ellomay Capital Ltd."
  },
  {
      "symbol": "ELMD",
      "name": "Electromed, Inc."
  },
  {
      "symbol": "ELN",
      "name": "Elan Corporation, plc"
  },
  {
      "symbol": "ELNK",
      "name": "EarthLink, Inc."
  },
  {
      "symbol": "ELON",
      "name": "Echelon Corporation"
  },
  {
      "symbol": "ELOS",
      "name": "Syneron Medical Ltd."
  },
  {
      "symbol": "ELP",
      "name": "Companhia Paranaense de Energia (COPEL)"
  },
  {
      "symbol": "ELRC",
      "name": "Electro Rent Corporation"
  },
  {
      "symbol": "ELS",
      "name": "Equity Lifestyle Properties, Inc."
  },
  {
      "symbol": "ELS^A",
      "name": "Equity Lifestyle Properties, Inc."
  },
  {
      "symbol": "ELSE",
      "name": "Electro-Sensors, Inc."
  },
  {
      "symbol": "ELT",
      "name": "Elster Group SE"
  },
  {
      "symbol": "ELTK",
      "name": "Eltek Ltd."
  },
  {
      "symbol": "ELX",
      "name": "Emulex Corporation"
  },
  {
      "symbol": "ELY",
      "name": "Callaway Golf Company"
  },
  {
      "symbol": "EMAN",
      "name": "eMagin Corporation"
  },
  {
      "symbol": "EMC",
      "name": "EMC Corporation"
  },
  {
      "symbol": "EMCB",
      "name": "WisdomTree Trust WisdomTree Emerging Markets Corporate Bond Fu"
  },
  {
      "symbol": "EMCF",
      "name": "Emclaire Financial Corp"
  },
  {
      "symbol": "EMCI",
      "name": "EMC Insurance Group, Inc."
  },
  {
      "symbol": "EMD",
      "name": "Western Asset Emerging Markets Income Fund, Inc"
  },
  {
      "symbol": "EMDI",
      "name": "iShares, Inc. iShares MSCI Emerging Markets Consumer Discrecti"
  },
  {
      "symbol": "EME",
      "name": "EMCOR Group, Inc."
  },
  {
      "symbol": "EMEY",
      "name": "iShares, Inc. iShares MSCI Emerging Markets Energy Sector Capp"
  },
  {
      "symbol": "EMF",
      "name": "Templeton Emerging Markets Fund"
  },
  {
      "symbol": "EMFN",
      "name": "iShares MSCI Emerging Markets Financials Sector Index Fund"
  },
  {
      "symbol": "EMI",
      "name": "Eaton Vance Michigan Municipal Income Trust"
  },
  {
      "symbol": "EMIF",
      "name": "iShares S&P Emerging Markets Infrastructure Index Fund"
  },
  {
      "symbol": "EMITF",
      "name": "Elbit Imaging Ltd."
  },
  {
      "symbol": "EMJ",
      "name": "Eaton Vance New Jersey Municipal Bond Fund"
  },
  {
      "symbol": "EMKR",
      "name": "EMCORE Corporation"
  },
  {
      "symbol": "EML",
      "name": "Eastern Company (The)"
  },
  {
      "symbol": "EMMS",
      "name": "Emmis Communications Corporation"
  },
  {
      "symbol": "EMMSP",
      "name": "Emmis Communications Corporation"
  },
  {
      "symbol": "EMMT",
      "name": "iShares MSCI Emerging Markets Materials Sector Index Fund"
  },
  {
      "symbol": "EMN",
      "name": "Eastman Chemical Company"
  },
  {
      "symbol": "EMO",
      "name": "ClearBridge Energy MLP Opportunity Fund Inc."
  },
  {
      "symbol": "EMQ",
      "name": "Entergy Mississippi, Inc."
  },
  {
      "symbol": "EMR",
      "name": "Emerson Electric Company"
  },
  {
      "symbol": "EMXX",
      "name": "Eurasian Minerals Inc."
  },
  {
      "symbol": "EMZ",
      "name": "Entergy Mississippi, Inc."
  },
  {
      "symbol": "ENA",
      "name": "Enova Systems Inc."
  },
  {
      "symbol": "ENB",
      "name": "Enbridge Inc"
  },
  {
      "symbol": "END",
      "name": "Endeavor International Corporation"
  },
  {
      "symbol": "ENDP",
      "name": "Endo Pharmaceuticals Holdings Inc."
  },
  {
      "symbol": "ENG",
      "name": "ENGlobal Corporation"
  },
  {
      "symbol": "ENH",
      "name": "Endurance Specialty Holdings Ltd"
  },
  {
      "symbol": "ENH^A",
      "name": "Endurance Specialty Holdings Ltd"
  },
  {
      "symbol": "ENH^B",
      "name": "Endurance Specialty Holdings Ltd"
  },
  {
      "symbol": "ENI",
      "name": "Enersis S A"
  },
  {
      "symbol": "ENL",
      "name": "Reed Elsevier NV"
  },
  {
      "symbol": "ENMD",
      "name": "EntreMed, Inc."
  },
  {
      "symbol": "ENOC",
      "name": "EnerNOC, Inc."
  },
  {
      "symbol": "ENPH",
      "name": "Enphase Energy, Inc."
  },
  {
      "symbol": "ENR",
      "name": "Energizer Holdings, Inc."
  },
  {
      "symbol": "ENS",
      "name": "Enersys"
  },
  {
      "symbol": "ENSG",
      "name": "The Ensign Group, Inc."
  },
  {
      "symbol": "ENTG",
      "name": "Entegris, Inc."
  },
  {
      "symbol": "ENTR",
      "name": "Entropic Communications, Inc."
  },
  {
      "symbol": "ENV",
      "name": "Envestnet, Inc"
  },
  {
      "symbol": "ENVI",
      "name": "Envivio, Inc."
  },
  {
      "symbol": "ENX",
      "name": "Eaton Vance New York Municipal Bond Fund"
  },
  {
      "symbol": "ENZ",
      "name": "Enzo Biochem, Inc."
  },
  {
      "symbol": "ENZN",
      "name": "Enzon Pharmaceuticals, Inc."
  },
  {
      "symbol": "EOC",
      "name": "Empresa Nacional de Electricidad S.A."
  },
  {
      "symbol": "EOD",
      "name": "Wells Fargo Advantage Global Dividend Opportunity Fund"
  },
  {
      "symbol": "EOG",
      "name": "EOG Resources, Inc."
  },
  {
      "symbol": "EOI",
      "name": "Eaton Vance Enhance Equity Income Fund"
  },
  {
      "symbol": "EONC",
      "name": "eOn Communications Corporation"
  },
  {
      "symbol": "EOS",
      "name": "Eaton Vance Enhanced Equity Income Fund II"
  },
  {
      "symbol": "EOT",
      "name": "Eaton Vance Municipal Income Trust"
  },
  {
      "symbol": "EP",
      "name": "El Paso Corporation"
  },
  {
      "symbol": "EP^C",
      "name": "El Paso Corporation"
  },
  {
      "symbol": "EPAM",
      "name": "EPAM Systems, Inc."
  },
  {
      "symbol": "EPAX",
      "name": "Ambassadors Group, Inc."
  },
  {
      "symbol": "EPAY",
      "name": "Bottomline Technologies, Inc."
  },
  {
      "symbol": "EPB",
      "name": "El Paso Pipeline Partners LP"
  },
  {
      "symbol": "EPD",
      "name": "Enterprise Products Partners L.P."
  },
  {
      "symbol": "EPHC",
      "name": "Epoch Holding Corporation"
  },
  {
      "symbol": "EPIQ",
      "name": "EPIQ Systems, Inc."
  },
  {
      "symbol": "EPL",
      "name": "Energy Partners, Ltd."
  },
  {
      "symbol": "EPM",
      "name": "Evolution Petroleum Corporation, Inc."
  },
  {
      "symbol": "EPM^A",
      "name": "Evolution Petroleum Corporation, Inc."
  },
  {
      "symbol": "EPOC",
      "name": "Epocrates, Inc."
  },
  {
      "symbol": "EPR",
      "name": "Entertainment Properties Trust"
  },
  {
      "symbol": "EPR^C",
      "name": "Entertainment Properties Trust"
  },
  {
      "symbol": "EPR^D",
      "name": "Entertainment Properties Trust"
  },
  {
      "symbol": "EPR^E",
      "name": "Entertainment Properties Trust"
  },
  {
      "symbol": "EQIX",
      "name": "Equinix, Inc."
  },
  {
      "symbol": "EQR",
      "name": "Equity Residential"
  },
  {
      "symbol": "EQR^N",
      "name": "Equity Residential"
  },
  {
      "symbol": "EQS",
      "name": "Equus Total Return, Inc."
  },
  {
      "symbol": "EQT",
      "name": "EQT Corporation"
  },
  {
      "symbol": "EQU",
      "name": "Equal Energy Ltd."
  },
  {
      "symbol": "EQY",
      "name": "Equity One, Inc."
  },
  {
      "symbol": "ERC",
      "name": "Wells Fargo Advantage Multi-Sector Income Fund"
  },
  {
      "symbol": "ERF",
      "name": "Enerplus Corporation"
  },
  {
      "symbol": "ERH",
      "name": "Wells Fargo Advantage Utilities and High Income Fund"
  },
  {
      "symbol": "ERIC",
      "name": "Ericsson"
  },
  {
      "symbol": "ERIE",
      "name": "Erie Indemnity Company"
  },
  {
      "symbol": "ERII",
      "name": "Energy Recovery, Inc."
  },
  {
      "symbol": "ERJ",
      "name": "Embraer-Empresa Brasileira de Aeronautica"
  },
  {
      "symbol": "EROC",
      "name": "Eagle Rock Energy Partners, L.P."
  },
  {
      "symbol": "EROCW",
      "name": "Eagle Rock Energy Partners, L.P."
  },
  {
      "symbol": "ERT",
      "name": "eResearch Technology Inc."
  },
  {
      "symbol": "ES",
      "name": "EnergySolutions Inc"
  },
  {
      "symbol": "ESA",
      "name": "Energy Services Acquisition Corp"
  },
  {
      "symbol": "ESBF",
      "name": "ESB Financial Corporation"
  },
  {
      "symbol": "ESBK",
      "name": "The Elmira Savings Bank, FSB"
  },
  {
      "symbol": "ESC",
      "name": "Emeritus Corporation"
  },
  {
      "symbol": "ESCA",
      "name": "Escalade, Incorporated"
  },
  {
      "symbol": "ESD",
      "name": "Western Asset Emerging Markets Debt Fund Inc"
  },
  {
      "symbol": "ESE",
      "name": "ESCO Technologies Inc."
  },
  {
      "symbol": "ESEA",
      "name": "Euroseas Ltd."
  },
  {
      "symbol": "ESGR",
      "name": "Enstar Group Limited"
  },
  {
      "symbol": "ESI",
      "name": "ITT Educational Services, Inc."
  },
  {
      "symbol": "ESIC",
      "name": "EasyLink Services International Corporation"
  },
  {
      "symbol": "ESIO",
      "name": "Electro Scientific Industries, Inc."
  },
  {
      "symbol": "ESL",
      "name": "Esterline Technologies Corporation"
  },
  {
      "symbol": "ESLT",
      "name": "Elbit Systems Ltd."
  },
  {
      "symbol": "ESMC",
      "name": "Escalon Medical Corp."
  },
  {
      "symbol": "ESP",
      "name": "Espey Mfg. & Electronics Corp."
  },
  {
      "symbol": "ESRX",
      "name": "Express Scripts Holding Company"
  },
  {
      "symbol": "ESS",
      "name": "Essex Property Trust, Inc."
  },
  {
      "symbol": "ESS^H",
      "name": "Essex Property Trust, Inc."
  },
  {
      "symbol": "ESSA",
      "name": "ESSA Bancorp, Inc."
  },
  {
      "symbol": "ESSX",
      "name": "Essex Rental Corporation"
  },
  {
      "symbol": "ESTE",
      "name": "Earthstone Energy, Inc."
  },
  {
      "symbol": "ESV",
      "name": "ENSCO plc"
  },
  {
      "symbol": "ESYS",
      "name": "Elecsys Corporation"
  },
  {
      "symbol": "ET",
      "name": "ExactTarget, Inc."
  },
  {
      "symbol": "ETAK",
      "name": "Elephant Talk Communications Inc"
  },
  {
      "symbol": "ETB",
      "name": "Eaton Vance Tax-Managed Buy-Write Income Fund"
  },
  {
      "symbol": "ETE",
      "name": "Energy Transfer Equity, L.P."
  },
  {
      "symbol": "ETF",
      "name": "Aberdeen Emerging Markets Telecommunications and Infrastructur"
  },
  {
      "symbol": "ETFC",
      "name": "E*TRADE Financial Corporation"
  },
  {
      "symbol": "ETG",
      "name": "Eaton Vance Tax-Advantaged Global Dividend Income Fund"
  },
  {
      "symbol": "ETH",
      "name": "Ethan Allen Interiors Inc."
  },
  {
      "symbol": "ETJ",
      "name": "Eaton Vance Risk-Managed Diversified Equity Income Fund"
  },
  {
      "symbol": "ETM",
      "name": "Entercom Communications Corporation"
  },
  {
      "symbol": "ETN",
      "name": "Eaton Corporation"
  },
  {
      "symbol": "ETO",
      "name": "Eaton Vance Tax-Advantage Global Dividend Opp"
  },
  {
      "symbol": "ETP",
      "name": "ENERGY TRANSFER PARTNERS"
  },
  {
      "symbol": "ETR",
      "name": "Entergy Corporation"
  },
  {
      "symbol": "ETRM",
      "name": "EnteroMedics Inc."
  },
  {
      "symbol": "ETUA",
      "name": "eUnits 2 Year U.S. Market Participation Trust"
  },
  {
      "symbol": "ETV",
      "name": "Eaton Vance Corporation"
  },
  {
      "symbol": "ETW",
      "name": "Eaton Vance Corporation"
  },
  {
      "symbol": "ETY",
      "name": "Eaton Vance Tax-Managed Diversified Equity Income Fund"
  },
  {
      "symbol": "EUFN",
      "name": "iShares MSCI Europe Financials Sector Index Fund"
  },
  {
      "symbol": "EV",
      "name": "Eaton Vance Corporation"
  },
  {
      "symbol": "EVAL",
      "name": "iShares, Inc. iShares MSCI Emerging Markets Value Index Fund"
  },
  {
      "symbol": "EVBN",
      "name": "Evans Bancorp, Inc."
  },
  {
      "symbol": "EVBS",
      "name": "Eastern Virginia Bankshares, Inc."
  },
  {
      "symbol": "EVC",
      "name": "Entravision Communications Corporation"
  },
  {
      "symbol": "EVEP",
      "name": "EV Energy Partners, L.P."
  },
  {
      "symbol": "EVER",
      "name": "EverBank Financial Corp."
  },
  {
      "symbol": "EVF",
      "name": "Eaton Vance Senior Income Trust"
  },
  {
      "symbol": "EVG",
      "name": "Eaton Vance Short Diversified Income Fund"
  },
  {
      "symbol": "EVI",
      "name": "EnviroStarm, Inc."
  },
  {
      "symbol": "EVJ",
      "name": "Eaton Vance New Jersey Municipal Income Trust"
  },
  {
      "symbol": "EVK",
      "name": "Ever-Glory International Group, Inc."
  },
  {
      "symbol": "EVM",
      "name": "Eaton Vance California Municipal Bond Fund"
  },
  {
      "symbol": "EVN",
      "name": "Eaton Vance Municipal Income Trust"
  },
  {
      "symbol": "EVO",
      "name": "Eaton Vance Ohio Municipal Income Trust"
  },
  {
      "symbol": "EVOL",
      "name": "Evolving Systems, Inc."
  },
  {
      "symbol": "EVP",
      "name": "Eaton Vance Pennsylvania Municipal Income Trust"
  },
  {
      "symbol": "EVR",
      "name": "Evercore Partners Inc"
  },
  {
      "symbol": "EVT",
      "name": "Eaton Vance Tax Advantaged Dividend Income Fund"
  },
  {
      "symbol": "EVV",
      "name": "Eaton Vance Limited Duration Income Fund"
  },
  {
      "symbol": "EVY",
      "name": "Eaton Vance New York Municipal Income Trust"
  },
  {
      "symbol": "EW",
      "name": "Edwards Lifesciences Corporation"
  },
  {
      "symbol": "EWBC",
      "name": "East West Bancorp, Inc."
  },
  {
      "symbol": "EXAC",
      "name": "Exactech, Inc."
  },
  {
      "symbol": "EXAM",
      "name": "ExamWorks Group, Inc."
  },
  {
      "symbol": "EXAR",
      "name": "Exar Corporation"
  },
  {
      "symbol": "EXAS",
      "name": "EXACT Sciences Corporation"
  },
  {
      "symbol": "EXBD",
      "name": "The Corporate Executive Board Company"
  },
  {
      "symbol": "EXC",
      "name": "Exelon Corporation"
  },
  {
      "symbol": "EXD",
      "name": "Eaton Vance Tax-Advantaged Bond"
  },
  {
      "symbol": "EXE",
      "name": "Crexendo, Inc."
  },
  {
      "symbol": "EXEL",
      "name": "Exelixis, Inc."
  },
  {
      "symbol": "EXFO",
      "name": "EXFO Inc"
  },
  {
      "symbol": "EXG",
      "name": "Eaton Vance Tax-Managed Global Diversified Equity Income Fund"
  },
  {
      "symbol": "EXH",
      "name": "Exterran Holdings, Inc."
  },
  {
      "symbol": "EXK",
      "name": "Endeavour Silver Corporation"
  },
  {
      "symbol": "EXL",
      "name": "Excel Trust, Inc."
  },
  {
      "symbol": "EXL^B",
      "name": "Excel Trust, Inc."
  },
  {
      "symbol": "EXLP",
      "name": "Exterran Partners, L.P."
  },
  {
      "symbol": "EXLS",
      "name": "ExlService Holdings, Inc."
  },
  {
      "symbol": "EXM",
      "name": "Excel Maritime Carriers Ltd."
  },
  {
      "symbol": "EXP",
      "name": "Eagle Materials Inc"
  },
  {
      "symbol": "EXPD",
      "name": "Expeditors International of Washington, Inc."
  },
  {
      "symbol": "EXPE",
      "name": "Expedia, Inc."
  },
  {
      "symbol": "EXPO",
      "name": "Exponent, Inc."
  },
  {
      "symbol": "EXPR",
      "name": "Express, Inc."
  },
  {
      "symbol": "EXR",
      "name": "Extra Space Storage Inc"
  },
  {
      "symbol": "EXTR",
      "name": "Extreme Networks, Inc."
  },
  {
      "symbol": "EXXI",
      "name": "Energy XXI (Bermuda) Limited"
  },
  {
      "symbol": "EZCH",
      "name": "EZchip Semiconductor Limited"
  },
  {
      "symbol": "EZPW",
      "name": "EZCORP, Inc."
  },
  {
      "symbol": "F",
      "name": "Ford Motor Company"
  },
  {
      "symbol": "F/WS",
      "name": "Ford Motor Company"
  },
  {
      "symbol": "F^A",
      "name": "Ford Motor Company"
  },
  {
      "symbol": "FABK",
      "name": "First Advantage Bancorp"
  },
  {
      "symbol": "FAC",
      "name": "Liberte Investors Inc."
  },
  {
      "symbol": "FACE",
      "name": "Physicians Formula Holdings, Inc."
  },
  {
      "symbol": "FAF",
      "name": "First American Corporation (The)"
  },
  {
      "symbol": "FALC",
      "name": "FalconStor Software, Inc."
  },
  {
      "symbol": "FAM",
      "name": "First Trust/Aberdeen Global Opportunity Income Fund"
  },
  {
      "symbol": "FARM",
      "name": "Farmer Brothers Company"
  },
  {
      "symbol": "FARO",
      "name": "FARO Technologies, Inc."
  },
  {
      "symbol": "FAST",
      "name": "Fastenal Company"
  },
  {
      "symbol": "FAV",
      "name": "First Trust Active Dividend Income Fund"
  },
  {
      "symbol": "FAX",
      "name": "Aberdeen Asia-Pacific Income Fund Inc"
  },
  {
      "symbol": "FBC",
      "name": "Flagstar Bancorp, Inc."
  },
  {
      "symbol": "FBF^M",
      "name": "FleetBoston Financial Corporation"
  },
  {
      "symbol": "FBF^N",
      "name": "FleetBoston Financial Corporation"
  },
  {
      "symbol": "FBHS",
      "name": "Fortune Brands Home & Security, Inc."
  },
  {
      "symbol": "FBIZ",
      "name": "First Business Financial Services, Inc."
  },
  {
      "symbol": "FBMI",
      "name": "Firstbank Corporation"
  },
  {
      "symbol": "FBMS",
      "name": "The First Bancshares, Inc."
  },
  {
      "symbol": "FBN",
      "name": "Furniture Brands International, Inc."
  },
  {
      "symbol": "FBNC",
      "name": "First Bancorp"
  },
  {
      "symbol": "FBNK",
      "name": "First Connecticut Bancorp, Inc."
  },
  {
      "symbol": "FBP",
      "name": "First BanCorp."
  },
  {
      "symbol": "FBR",
      "name": "Fibria Celulose S.A."
  },
  {
      "symbol": "FBRC",
      "name": "FBR & Co"
  },
  {
      "symbol": "FBS^A",
      "name": "First Banks, Inc."
  },
  {
      "symbol": "FBSI",
      "name": "First Bancshares, Inc."
  },
  {
      "symbol": "FBSS",
      "name": "Fauquier Bankshares, Inc."
  },
  {
      "symbol": "FC",
      "name": "Franklin Covey Company"
  },
  {
      "symbol": "FCAL",
      "name": "First California Financial Group, Inc."
  },
  {
      "symbol": "FCAP",
      "name": "First Capital, Inc."
  },
  {
      "symbol": "FCBC",
      "name": "First Community Bancshares, Inc."
  },
  {
      "symbol": "FCCO",
      "name": "First Community Corporation"
  },
  {
      "symbol": "FCCY",
      "name": "1st Constitution Bancorp (NJ)"
  },
  {
      "symbol": "FCE/A",
      "name": "Forest City Enterprises Inc"
  },
  {
      "symbol": "FCE/B",
      "name": "Forest City Enterprises Inc"
  },
  {
      "symbol": "FCEL",
      "name": "FuelCell Energy, Inc."
  },
  {
      "symbol": "FCF",
      "name": "First Commonwealth Financial Corporation"
  },
  {
      "symbol": "FCFC",
      "name": "FirstCity Financial Corporation"
  },
  {
      "symbol": "FCFS",
      "name": "First Cash Financial Services, Inc."
  },
  {
      "symbol": "FCH",
      "name": "FelCor Lodging Trust Incorporated"
  },
  {
      "symbol": "FCH^A",
      "name": "FelCor Lodging Trust Incorporated"
  },
  {
      "symbol": "FCH^C",
      "name": "FelCor Lodging Trust Incorporated"
  },
  {
      "symbol": "FCHI",
      "name": "iShares FTSE China (HK Listed) Index Fund"
  },
  {
      "symbol": "FCLF",
      "name": "First Clover Leaf Financial Corp."
  },
  {
      "symbol": "FCN",
      "name": "FTI Consulting, Inc."
  },
  {
      "symbol": "FCNCA",
      "name": "First Citizens BancShares, Inc."
  },
  {
      "symbol": "FCO",
      "name": "Aberdeen Global Income Fund, Inc."
  },
  {
      "symbol": "FCS",
      "name": "Fairchild Semiconductor International, Inc."
  },
  {
      "symbol": "FCT",
      "name": "First Trust Senior Floating Rate Income Fund II"
  },
  {
      "symbol": "FCTY",
      "name": "1st Century Bancshares, Inc"
  },
  {
      "symbol": "FCVA",
      "name": "First Capital Bancorp, Inc. (VA)"
  },
  {
      "symbol": "FCX",
      "name": "Freeport-McMoran Copper & Gold, Inc."
  },
  {
      "symbol": "FCY",
      "name": "Forest City Enterprises Inc"
  },
  {
      "symbol": "FCZA",
      "name": "First Citizens Banc Corp."
  },
  {
      "symbol": "FDEF",
      "name": "First Defiance Financial Corp."
  },
  {
      "symbol": "FDI",
      "name": "Fort Dearborn Income Securities, Inc."
  },
  {
      "symbol": "FDML",
      "name": "Federal-Mogul Corporation"
  },
  {
      "symbol": "FDO",
      "name": "Family Dollar Stores, Inc."
  },
  {
      "symbol": "FDP",
      "name": "Fresh Del Monte Produce, Inc."
  },
  {
      "symbol": "FDS",
      "name": "FactSet Research Systems Inc."
  },
  {
      "symbol": "FDUS",
      "name": "Fidus Investment Corporation"
  },
  {
      "symbol": "FDX",
      "name": "FedEx Corporation"
  },
  {
      "symbol": "FE",
      "name": "FirstEnergy Corporation"
  },
  {
      "symbol": "FEFN",
      "name": "iShares MSCI Far East Financials Sector Index Fund"
  },
  {
      "symbol": "FEIC",
      "name": "FEI Company"
  },
  {
      "symbol": "FEIM",
      "name": "Frequency Electronics, Inc."
  },
  {
      "symbol": "FELE",
      "name": "Franklin Electric Co., Inc."
  },
  {
      "symbol": "FEN",
      "name": "First Trust Energy Income and Growth Fund"
  },
  {
      "symbol": "FENG",
      "name": "Phoenix New Media Limited"
  },
  {
      "symbol": "FEO",
      "name": "First Trust/Aberdeen Emerging Opportunity Fund"
  },
  {
      "symbol": "FES",
      "name": "Forbes Energy Services Ltd"
  },
  {
      "symbol": "FET",
      "name": "Forum Energy Technologies, Inc."
  },
  {
      "symbol": "FF",
      "name": "FutureFuel Corp."
  },
  {
      "symbol": "FFA",
      "name": "First Trust"
  },
  {
      "symbol": "FFBC",
      "name": "First Financial Bancorp."
  },
  {
      "symbol": "FFBCW",
      "name": "First Financial Bancorp."
  },
  {
      "symbol": "FFBH",
      "name": "First Federal Bancshares of Arkansas, Inc."
  },
  {
      "symbol": "FFC",
      "name": "Flaherty & Crumrine/Claymore Preferred Securities Income Fd In"
  },
  {
      "symbol": "FFCH",
      "name": "First Financial Holdings, Inc."
  },
  {
      "symbol": "FFCO",
      "name": "FedFirst Financial Corporation"
  },
  {
      "symbol": "FFD",
      "name": "Morgan Stanley Frontier Emerging markets Fund, Inc."
  },
  {
      "symbol": "FFDF",
      "name": "FFD Financial Corporation"
  },
  {
      "symbol": "FFEX",
      "name": "Frozen Food Express Industries, Inc."
  },
  {
      "symbol": "FFFD",
      "name": "North Central Bancshares, Inc."
  },
  {
      "symbol": "FFG",
      "name": "FBL Financial Group, Inc."
  },
  {
      "symbol": "FFHL",
      "name": "Fuwei Films (Holdings) Co., Ltd."
  },
  {
      "symbol": "FFI",
      "name": "Fortune Diversified Industries, Inc."
  },
  {
      "symbol": "FFIC",
      "name": "Flushing Financial Corporation"
  },
  {
      "symbol": "FFIN",
      "name": "First Financial Bankshares, Inc."
  },
  {
      "symbol": "FFIV",
      "name": "F5 Networks, Inc."
  },
  {
      "symbol": "FFKT",
      "name": "Farmers Capital Bank Corporation"
  },
  {
      "symbol": "FFKY",
      "name": "First Financial Service Corporation"
  },
  {
      "symbol": "FFN",
      "name": "FriendFinder Networks Inc."
  },
  {
      "symbol": "FFNM",
      "name": "First Federal of Northern Michigan Bancorp, Inc."
  },
  {
      "symbol": "FFNW",
      "name": "First Financial Northwest, Inc."
  },
  {
      "symbol": "FFZ^K",
      "name": "SiM Internal Test 4"
  },
  {
      "symbol": "FGB",
      "name": "First Trust Specialty Finance and Financial Opportunities Fund"
  },
  {
      "symbol": "FGC",
      "name": "FPL Group Capital Inc"
  },
  {
      "symbol": "FGE",
      "name": "FPL Group Capital Inc"
  },
  {
      "symbol": "FGP",
      "name": "Ferrellgas Partners, L.P."
  },
  {
      "symbol": "FHCO",
      "name": "Female Health Company (The)"
  },
  {
      "symbol": "FHN",
      "name": "First Tennessee National Corporation"
  },
  {
      "symbol": "FHY",
      "name": "First Trust Strategic High Income Fund II"
  },
  {
      "symbol": "FIBK",
      "name": "First Interstate BancSystem, Inc."
  },
  {
      "symbol": "FICO",
      "name": "Fair, Isaac and Company, Incorporated"
  },
  {
      "symbol": "FIF",
      "name": "First Trust Energy Infrastructure Fund"
  },
  {
      "symbol": "FIG",
      "name": "Fortress Investment Group LLC"
  },
  {
      "symbol": "FII",
      "name": "Federated Investors, Inc."
  },
  {
      "symbol": "FINL",
      "name": "The Finish Line, Inc."
  },
  {
      "symbol": "FIO",
      "name": "Fusion-io, Inc."
  },
  {
      "symbol": "FIRE",
      "name": "Sourcefire, Inc."
  },
  {
      "symbol": "FIS",
      "name": "Fidelity National Information Services, Inc."
  },
  {
      "symbol": "FISI",
      "name": "Financial Institutions, Inc."
  },
  {
      "symbol": "FISV",
      "name": "Fiserv, Inc."
  },
  {
      "symbol": "FITB",
      "name": "Fifth Third Bancorp"
  },
  {
      "symbol": "FITBP",
      "name": "Fifth Third Bancorp"
  },
  {
      "symbol": "FIX",
      "name": "Comfort Systems USA, Inc."
  },
  {
      "symbol": "FIZZ",
      "name": "National Beverage Corp."
  },
  {
      "symbol": "FJA",
      "name": "Merrill Lynch Depositor, Inc."
  },
  {
      "symbol": "FL",
      "name": "Footlocker Inc"
  },
  {
      "symbol": "FLC",
      "name": "Flaherty & Crumrine/Claymore Total Return Fund Inc"
  },
  {
      "symbol": "FLDM",
      "name": "Fluidigm Corporation"
  },
  {
      "symbol": "FLEX",
      "name": "Flextronics International Ltd."
  },
  {
      "symbol": "FLIC",
      "name": "The First of Long Island Corporation"
  },
  {
      "symbol": "FLIR",
      "name": "FLIR Systems, Inc."
  },
  {
      "symbol": "FLL",
      "name": "Full House Resorts, Inc."
  },
  {
      "symbol": "FLML",
      "name": "Flamel Technologies S.A."
  },
  {
      "symbol": "FLO",
      "name": "Flowers Foods, Inc."
  },
  {
      "symbol": "FLOW",
      "name": "Flow International Corporation"
  },
  {
      "symbol": "FLR",
      "name": "Fluor Corporation"
  },
  {
      "symbol": "FLS",
      "name": "Flowserve Corporation"
  },
  {
      "symbol": "FLT",
      "name": "FleetCor Technologies, Inc."
  },
  {
      "symbol": "FLWS",
      "name": "1-800 FLOWERS.COM, Inc."
  },
  {
      "symbol": "FLXS",
      "name": "Flexsteel Industries, Inc."
  },
  {
      "symbol": "FLY",
      "name": "Fly Leasing Limited"
  },
  {
      "symbol": "FMBI",
      "name": "First Midwest Bancorp, Inc."
  },
  {
      "symbol": "FMC",
      "name": "FMC Corporation"
  },
  {
      "symbol": "FMCN",
      "name": "Focus Media Holding Limited"
  },
  {
      "symbol": "FMD",
      "name": "First Marblehead Corporation (The)"
  },
  {
      "symbol": "FMER",
      "name": "FirstMerit Corporation"
  },
  {
      "symbol": "FMFC",
      "name": "First M & F Corporation"
  },
  {
      "symbol": "FMN",
      "name": "Federated Premier Municipal Income Fund"
  },
  {
      "symbol": "FMNB",
      "name": "Farmers National Banc Corp."
  },
  {
      "symbol": "FMO",
      "name": "Fiduciary/Claymore MLP Opportunity Fund"
  },
  {
      "symbol": "FMS",
      "name": "Fresenius Medical Care Corporation"
  },
  {
      "symbol": "FMS^",
      "name": "Fresenius Medical Care Corporation"
  },
  {
      "symbol": "FMX",
      "name": "Fomento Economico Mexicano S.A.B. de C.V."
  },
  {
      "symbol": "FMY",
      "name": "First Trust"
  },
  {
      "symbol": "FN",
      "name": "Fabrinet"
  },
  {
      "symbol": "FNB",
      "name": "F.N.B. Corporation"
  },
  {
      "symbol": "FNBN",
      "name": "FNB United Corp."
  },
  {
      "symbol": "FNF",
      "name": "Fidelity National Financial, Inc."
  },
  {
      "symbol": "FNFG",
      "name": "First Niagara Financial Group Inc."
  },
  {
      "symbol": "FNFG^B",
      "name": "First Niagara Financial Group Inc."
  },
  {
      "symbol": "FNGN",
      "name": "Financial Engines, Inc."
  },
  {
      "symbol": "FNLC",
      "name": "First Bancorp, Inc (ME)"
  },
  {
      "symbol": "FNSR",
      "name": "Finisar Corporation"
  },
  {
      "symbol": "FNV",
      "name": "Franco Nev Corp"
  },
  {
      "symbol": "FOE",
      "name": "Ferro Corporation"
  },
  {
      "symbol": "FOF",
      "name": "Cohen & Steers Closed-End Opportunity Fund, Inc."
  },
  {
      "symbol": "FOH",
      "name": "Frederick&#39;s of Hollywood Group"
  },
  {
      "symbol": "FOLD",
      "name": "Amicus Therapeutics, Inc."
  },
  {
      "symbol": "FONE",
      "name": "First Trust NASDAQ CEA Smartphone Index Fund"
  },
  {
      "symbol": "FONR",
      "name": "Fonar Corporation"
  },
  {
      "symbol": "FOR",
      "name": "Forestar Group Inc"
  },
  {
      "symbol": "FORD",
      "name": "Forward Industries, Inc."
  },
  {
      "symbol": "FORM",
      "name": "FormFactor, Inc."
  },
  {
      "symbol": "FORR",
      "name": "Forrester Research, Inc."
  },
  {
      "symbol": "FORTY",
      "name": "Formula Systems (1985) Ltd."
  },
  {
      "symbol": "FOSL",
      "name": "Fossil, Inc."
  },
  {
      "symbol": "FPC^A",
      "name": "Progress Energy, Inc."
  },
  {
      "symbol": "FPO",
      "name": "First Potomac Realty Trust"
  },
  {
      "symbol": "FPO^A",
      "name": "First Potomac Realty Trust"
  },
  {
      "symbol": "FPP",
      "name": "FieldPoint Petroleum Corporation"
  },
  {
      "symbol": "FPP/WS",
      "name": "FieldPoint Petroleum Corporation"
  },
  {
      "symbol": "FPT",
      "name": "Federated Premier Intermediate Municipal Income Fund"
  },
  {
      "symbol": "FR",
      "name": "First Industrial Realty Trust, Inc."
  },
  {
      "symbol": "FR^J",
      "name": "First Industrial Realty Trust, Inc."
  },
  {
      "symbol": "FR^K",
      "name": "First Industrial Realty Trust, Inc."
  },
  {
      "symbol": "FRA",
      "name": "Blackrock Floating Rate Income Strategies Fund Inc"
  },
  {
      "symbol": "FRAN",
      "name": "Francesca&#39;s Holdings Corporation"
  },
  {
      "symbol": "FRB",
      "name": "Blackrock Floating Rate Income Strategies Fund II Inc"
  },
  {
      "symbol": "FRBK",
      "name": "Republic First Bancorp, Inc."
  },
  {
      "symbol": "FRC",
      "name": "FIRST REPUBLIC BANK"
  },
  {
      "symbol": "FRC^A",
      "name": "FIRST REPUBLIC BANK"
  },
  {
      "symbol": "FRCCO",
      "name": "First Republic Preferred Capital Corporation"
  },
  {
      "symbol": "FRD",
      "name": "Friedman Industries Inc."
  },
  {
      "symbol": "FRED",
      "name": "Fred&#39;s, Inc."
  },
  {
      "symbol": "FREE",
      "name": "FreeSeas Inc."
  },
  {
      "symbol": "FRF",
      "name": "Fortegra Financial Corporation"
  },
  {
      "symbol": "FRGIV",
      "name": "Fiesta Restaurant Group, Inc."
  },
  {
      "symbol": "FRM",
      "name": "Furmanite Corporation"
  },
  {
      "symbol": "FRME",
      "name": "First Merchants Corporation"
  },
  {
      "symbol": "FRNK",
      "name": "Franklin Financial Corporation"
  },
  {
      "symbol": "FRO",
      "name": "Frontline Ltd."
  },
  {
      "symbol": "FRP",
      "name": "FairPoint Communications, Inc."
  },
  {
      "symbol": "FRS",
      "name": "Frisch&#39;s Restaurants, Inc."
  },
  {
      "symbol": "FRT",
      "name": "Federal Realty Investment Trust"
  },
  {
      "symbol": "FRX",
      "name": "Forest Laboratories, Inc."
  },
  {
      "symbol": "FSBI",
      "name": "Fidelity Bancorp, Inc."
  },
  {
      "symbol": "FSBK",
      "name": "First South Bancorp Inc"
  },
  {
      "symbol": "FSC",
      "name": "Fifth Street Finance Corp."
  },
  {
      "symbol": "FSCI",
      "name": "Fisher Communications, Inc."
  },
  {
      "symbol": "FSD",
      "name": "First Trust High Income Long Short Fund"
  },
  {
      "symbol": "FSFG",
      "name": "First Savings Financial Group, Inc."
  },
  {
      "symbol": "FSGI",
      "name": "First Security Group, Inc."
  },
  {
      "symbol": "FSI",
      "name": "Flexible Solutions International Inc."
  },
  {
      "symbol": "FSII",
      "name": "FSI International, Inc."
  },
  {
      "symbol": "FSIN",
      "name": "Fushi Copperweld, Inc."
  },
  {
      "symbol": "FSL",
      "name": "Freescale Semiconductor, Ltd."
  },
  {
      "symbol": "FSLR",
      "name": "First Solar, Inc."
  },
  {
      "symbol": "FSM",
      "name": "Fortuna Silver Mines Inc."
  },
  {
      "symbol": "FSP",
      "name": "Franklin Street Properties Corp."
  },
  {
      "symbol": "FSR",
      "name": "Flagstone Reinsurance Holdings S.A."
  },
  {
      "symbol": "FSRV",
      "name": "FirstService Corporation"
  },
  {
      "symbol": "FSS",
      "name": "Federal Signal Corporation"
  },
  {
      "symbol": "FST",
      "name": "Forest Oil Corporation"
  },
  {
      "symbol": "FSTR",
      "name": "L.B. Foster Company"
  },
  {
      "symbol": "FSYS",
      "name": "Fuel Systems Solutions, Inc."
  },
  {
      "symbol": "FT",
      "name": "Franklin Universal Trust"
  },
  {
      "symbol": "FTB^A",
      "name": "Fifth Third Bancorp"
  },
  {
      "symbol": "FTB^B",
      "name": "Fifth Third Bancorp"
  },
  {
      "symbol": "FTE",
      "name": "France Telecom S.A."
  },
  {
      "symbol": "FTEK",
      "name": "Fuel Tech, Inc."
  },
  {
      "symbol": "FTF",
      "name": "Franklin Templeton Limited Duration Income Trust"
  },
  {
      "symbol": "FTI",
      "name": "FMC Technologies, Inc."
  },
  {
      "symbol": "FTK",
      "name": "Flotek Industries, Inc."
  },
  {
      "symbol": "FTNT",
      "name": "Fortinet, Inc."
  },
  {
      "symbol": "FTR",
      "name": "Frontier Communications Company"
  },
  {
      "symbol": "FTT",
      "name": "Federated Enhanced Treasury Income Fund"
  },
  {
      "symbol": "FUBC",
      "name": "1st United Bancorp, Inc. (FL)"
  },
  {
      "symbol": "FUL",
      "name": "H. B. Fuller Company"
  },
  {
      "symbol": "FULL",
      "name": "Full Circle Capital Corporation"
  },
  {
      "symbol": "FULT",
      "name": "Fulton Financial Corporation"
  },
  {
      "symbol": "FUN",
      "name": "Cedar Fair, L.P."
  },
  {
      "symbol": "FUNC",
      "name": "First United Corporation"
  },
  {
      "symbol": "FUND",
      "name": "Royce Focus Trust, Inc."
  },
  {
      "symbol": "FUR",
      "name": "Winthrop Realty Trust"
  },
  {
      "symbol": "FUR^D",
      "name": "Winthrop Realty Trust"
  },
  {
      "symbol": "FURX",
      "name": "Furiex Pharmaceuticals, Inc."
  },
  {
      "symbol": "FVE",
      "name": "Five Star Quality Care, Inc."
  },
  {
      "symbol": "FWF/CL",
      "name": "Wells Fargo & Company"
  },
  {
      "symbol": "FWLT",
      "name": "Foster Wheeler AG."
  },
  {
      "symbol": "FWRD",
      "name": "Forward Air Corporation"
  },
  {
      "symbol": "FWV",
      "name": "First West Virginia Bancorp, Inc."
  },
  {
      "symbol": "FX",
      "name": "FX Alliance Inc."
  },
  {
      "symbol": "FXCB",
      "name": "Fox Chase Bancorp, Inc."
  },
  {
      "symbol": "FXCM",
      "name": "FXCM Inc."
  },
  {
      "symbol": "FXEN",
      "name": "FX Energy, Inc."
  },
  {
      "symbol": "G",
      "name": "Genpact Limited"
  },
  {
      "symbol": "GA",
      "name": "Giant Interactive Group Inc"
  },
  {
      "symbol": "GAB",
      "name": "Gabelli Equity Trust, Inc. (The)"
  },
  {
      "symbol": "GAB^D",
      "name": "Gabelli Equity Trust, Inc. (The)"
  },
  {
      "symbol": "GAB^F",
      "name": "Gabelli Equity Trust, Inc. (The)"
  },
  {
      "symbol": "GABC",
      "name": "German American Bancorp, Inc."
  },
  {
      "symbol": "GAGA",
      "name": "Le Gaga Holdings Limited"
  },
  {
      "symbol": "GAI",
      "name": "Global-Tech Advanced Innovations Inc."
  },
  {
      "symbol": "GAIA",
      "name": "Gaiam, Inc."
  },
  {
      "symbol": "GAIN",
      "name": "Gladstone Investment Corporation"
  },
  {
      "symbol": "GAINP",
      "name": "Gladstone Investment Corporation"
  },
  {
      "symbol": "GALE",
      "name": "Galena Biopharma, Inc."
  },
  {
      "symbol": "GALT",
      "name": "Galectin Therapeutics Inc."
  },
  {
      "symbol": "GALTU",
      "name": "Galectin Therapeutics Inc."
  },
  {
      "symbol": "GALTW",
      "name": "Galectin Therapeutics Inc."
  },
  {
      "symbol": "GAM",
      "name": "General American Investors, Inc."
  },
  {
      "symbol": "GAM^B",
      "name": "General American Investors, Inc."
  },
  {
      "symbol": "GAME",
      "name": "Shanda Games Limited"
  },
  {
      "symbol": "GAR",
      "name": "Georgia Power Company"
  },
  {
      "symbol": "GAS",
      "name": "AGL Resources, Inc."
  },
  {
      "symbol": "GASS",
      "name": "StealthGas, Inc."
  },
  {
      "symbol": "GAT",
      "name": "Georgia Power Company"
  },
  {
      "symbol": "GB",
      "name": "Greatbatch, Inc."
  },
  {
      "symbol": "GBAB",
      "name": "Guggenheim Build America Bonds Managed Duration Trust"
  },
  {
      "symbol": "GBCI",
      "name": "Glacier Bancorp, Inc."
  },
  {
      "symbol": "GBDC",
      "name": "Golub Capital BDC, Inc."
  },
  {
      "symbol": "GBG",
      "name": "Great Basin Gold, Ltd."
  },
  {
      "symbol": "GBL",
      "name": "Gamco Investors, Inc."
  },
  {
      "symbol": "GBLI",
      "name": "Global Indemnity plc"
  },
  {
      "symbol": "GBNK",
      "name": "Guaranty Bancorp"
  },
  {
      "symbol": "GBR",
      "name": "New Concept Energy, Inc"
  },
  {
      "symbol": "GBX",
      "name": "Greenbrier Companies, Inc. (The)"
  },
  {
      "symbol": "GCA",
      "name": "Global Cash Access Holdings, Inc."
  },
  {
      "symbol": "GCAP",
      "name": "GAIN Capital Holdings, Inc."
  },
  {
      "symbol": "GCBC",
      "name": "Greene County Bancorp, Inc."
  },
  {
      "symbol": "GCF",
      "name": "Global Income & Currency Fund Inc."
  },
  {
      "symbol": "GCFB",
      "name": "Granite City Food And Brewery Ltd."
  },
  {
      "symbol": "GCH",
      "name": "Greater China Fund, Inc."
  },
  {
      "symbol": "GCI",
      "name": "Gannett Co., Inc."
  },
  {
      "symbol": "GCO",
      "name": "Genesco Inc."
  },
  {
      "symbol": "GCOM",
      "name": "Globecomm Systems Inc."
  },
  {
      "symbol": "GCV",
      "name": "Gabelli Convertible and Income Securities Fund, Inc. (The)"
  },
  {
      "symbol": "GCV^B",
      "name": "Gabelli Convertible and Income Securities Fund, Inc. (The)"
  },
  {
      "symbol": "GCVRZ",
      "name": "Sanofi"
  },
  {
      "symbol": "GD",
      "name": "General Dynamics Corporation"
  },
  {
      "symbol": "GDF",
      "name": "Western Asset Global Partners Income Fund, Inc."
  },
  {
      "symbol": "GDI",
      "name": "Gardner Denver, Inc."
  },
  {
      "symbol": "GDL",
      "name": "The GDL Fund"
  },
  {
      "symbol": "GDL^B",
      "name": "The GDL Fund"
  },
  {
      "symbol": "GDO",
      "name": "Western Asset Global Corporate Defined Opportunity Fund Inc."
  },
  {
      "symbol": "GDOT",
      "name": "Green Dot Corporation"
  },
  {
      "symbol": "GDP",
      "name": "Goodrich Petroleum Corporation"
  },
  {
      "symbol": "GDV",
      "name": "Gabelli Dividend"
  },
  {
      "symbol": "GDV^A",
      "name": "Gabelli Dividend"
  },
  {
      "symbol": "GDV^D",
      "name": "Gabelli Dividend"
  },
  {
      "symbol": "GE",
      "name": "General Electric Company"
  },
  {
      "symbol": "GE^A",
      "name": "General Electric Company"
  },
  {
      "symbol": "GEA",
      "name": "General Electric Capital Corporation"
  },
  {
      "symbol": "GEC",
      "name": "General Electric Capital Corporation"
  },
  {
      "symbol": "GED",
      "name": "General Electric Capital Corporation"
  },
  {
      "symbol": "GEF",
      "name": "Greif Bros. Corporation"
  },
  {
      "symbol": "GEF/B",
      "name": "Greif Bros. Corporation"
  },
  {
      "symbol": "GEG",
      "name": "General Electric Capital Corporation"
  },
  {
      "symbol": "GEJ",
      "name": "General Electric Capital Corporation"
  },
  {
      "symbol": "GEL",
      "name": "Genesis Energy, L.P."
  },
  {
      "symbol": "GEN           ",
      "name": "GenOn Energy, Inc."
  },
  {
      "symbol": "GENC",
      "name": "Gencor Industries Inc."
  },
  {
      "symbol": "GENE",
      "name": "Genetic Technologies Ltd"
  },
  {
      "symbol": "GENT",
      "name": "Gentium SpA"
  },
  {
      "symbol": "GEO",
      "name": "Geo Group Inc (The)"
  },
  {
      "symbol": "GEOI",
      "name": "GeoResources, Inc."
  },
  {
      "symbol": "GEOY",
      "name": "GeoEye, Inc."
  },
  {
      "symbol": "GEP",
      "name": "General Electric Capital Corporation"
  },
  {
      "symbol": "GEQ",
      "name": "Guggenheim Equal Weight Enhanced Equity Income Fund"
  },
  {
      "symbol": "GER",
      "name": "General Electric Capital Corporation"
  },
  {
      "symbol": "GERN",
      "name": "Geron Corporation"
  },
  {
      "symbol": "GES",
      "name": "Guess?, Inc."
  },
  {
      "symbol": "GET",
      "name": "Gaylord Entertainment Company"
  },
  {
      "symbol": "GEVA",
      "name": "Synageva BioPharma Corp."
  },
  {
      "symbol": "GEVO",
      "name": "Gevo, Inc."
  },
  {
      "symbol": "GF",
      "name": "New Germany Fund, Inc. (The)"
  },
  {
      "symbol": "GFA",
      "name": "Gafisa SA"
  },
  {
      "symbol": "GFED",
      "name": "Guaranty Federal Bancshares, Inc."
  },
  {
      "symbol": "GFF",
      "name": "Griffon Corporation"
  },
  {
      "symbol": "GFI",
      "name": "Gold Fields Ltd."
  },
  {
      "symbol": "GFIG",
      "name": "GFI Group Inc."
  },
  {
      "symbol": "GFN",
      "name": "General Finance Corporation"
  },
  {
      "symbol": "GFNCL",
      "name": "General Finance Corporation"
  },
  {
      "symbol": "GFNCZ",
      "name": "General Finance Corporation"
  },
  {
      "symbol": "GFW",
      "name": "American Financial Group, Inc."
  },
  {
      "symbol": "GFY",
      "name": "Western Asset Variable Rate Strategic Fund Inc."
  },
  {
      "symbol": "GFZ",
      "name": "American Financial Group, Inc."
  },
  {
      "symbol": "GG",
      "name": "Goldcorp Incorporated"
  },
  {
      "symbol": "GGAL",
      "name": "Grupo Financiero Galicia S.A."
  },
  {
      "symbol": "GGB",
      "name": "Gerdau S.A."
  },
  {
      "symbol": "GGC",
      "name": "Georgia Gulf Corporation"
  },
  {
      "symbol": "GGE",
      "name": "Guggenheim Enhanced Equity Strategy Fund"
  },
  {
      "symbol": "GGG",
      "name": "Graco Inc."
  },
  {
      "symbol": "GGN",
      "name": "GAMCO Global Gold, Natural Reources & Income Trust by Gabelli"
  },
  {
      "symbol": "GGN^A",
      "name": "GAMCO Global Gold, Natural Reources & Income Trust by Gabelli"
  },
  {
      "symbol": "GGP",
      "name": "General Growth Properties, Inc."
  },
  {
      "symbol": "GGR",
      "name": "GeoGlobal Resources Inc."
  },
  {
      "symbol": "GGS",
      "name": "Global Geophysical Services, Inc."
  },
  {
      "symbol": "GGT",
      "name": "Gabelli Multi-Media Trust Inc. (The)"
  },
  {
      "symbol": "GGT^B",
      "name": "Gabelli Multi-Media Trust Inc. (The)"
  },
  {
      "symbol": "GHDX",
      "name": "Genomic Health, Inc."
  },
  {
      "symbol": "GHI",
      "name": "Global High Income Dollar Fund, Inc."
  },
  {
      "symbol": "GHL",
      "name": "Greenhill"
  },
  {
      "symbol": "GHM",
      "name": "Graham Corporation"
  },
  {
      "symbol": "GIB",
      "name": "CGI Group, Inc."
  },
  {
      "symbol": "GIFI",
      "name": "Gulf Island Fabrication, Inc."
  },
  {
      "symbol": "GIG",
      "name": "GigOptix, Inc."
  },
  {
      "symbol": "GIGA",
      "name": "Giga-tronics Incorporated"
  },
  {
      "symbol": "GIGM",
      "name": "GigaMedia Limited"
  },
  {
      "symbol": "GIII",
      "name": "G-III Apparel Group, LTD."
  },
  {
      "symbol": "GIL",
      "name": "Gildan Activewear, Inc."
  },
  {
      "symbol": "GILD",
      "name": "Gilead Sciences, Inc."
  },
  {
      "symbol": "GILT",
      "name": "Gilat Satellite Networks Ltd."
  },
  {
      "symbol": "GIM",
      "name": "Templeton Global Income Fund, Inc."
  },
  {
      "symbol": "GIS",
      "name": "General Mills, Inc."
  },
  {
      "symbol": "GIVN",
      "name": "Given Imaging Ltd."
  },
  {
      "symbol": "GJD",
      "name": "SYNTHETIC FIXED INCOME SECURITIES INC"
  },
  {
      "symbol": "GJH",
      "name": "SYNTHETIC FIXED INCOME SECURITIES INC"
  },
  {
      "symbol": "GJI",
      "name": "SYNTHETIC FIXED INCOME SECURITIES INC"
  },
  {
      "symbol": "GJJ",
      "name": "SYNTHETIC FIXED INCOME SECURITIES INC"
  },
  {
      "symbol": "GJK",
      "name": "SYNTHETIC FIXED INCOME SECURITIES INC"
  },
  {
      "symbol": "GJM",
      "name": "GMAC LLC"
  },
  {
      "symbol": "GJN",
      "name": "SYNTHETIC FIXED INCOME SECURITIES INC"
  },
  {
      "symbol": "GJO",
      "name": "SYNTHETIC FIXED INCOME SECURITIES INC"
  },
  {
      "symbol": "GJP",
      "name": "Synthetic Fixed-Income Securities, Inc."
  },
  {
      "symbol": "GJR",
      "name": "Synthetic Fixed-Income Securities, Inc."
  },
  {
      "symbol": "GJS",
      "name": "SYNTHETIC FIXED INCOME SECURITIES INC"
  },
  {
      "symbol": "GJT",
      "name": "Synthetic Fixed-Income Securities, Inc."
  },
  {
      "symbol": "GJV",
      "name": "Synthetic Fixed-Income Securities, Inc."
  },
  {
      "symbol": "GKK",
      "name": "Gramercy Capital Corp"
  },
  {
      "symbol": "GKK^A",
      "name": "Gramercy Capital Corp"
  },
  {
      "symbol": "GKM",
      "name": "GMAC LLC"
  },
  {
      "symbol": "GKNT",
      "name": "Geeknet, Inc."
  },
  {
      "symbol": "GKSR",
      "name": "G&K Services, Inc."
  },
  {
      "symbol": "GLAD",
      "name": "Gladstone Capital Corporation"
  },
  {
      "symbol": "GLADP",
      "name": "Gladstone Capital Corporation"
  },
  {
      "symbol": "GLBS",
      "name": "Globus Maritime Limited"
  },
  {
      "symbol": "GLBZ",
      "name": "Glen Burnie Bancorp"
  },
  {
      "symbol": "GLCH",
      "name": "Gleacher & Company, Inc."
  },
  {
      "symbol": "GLDC",
      "name": "Golden Enterprises, Inc."
  },
  {
      "symbol": "GLDD",
      "name": "Great Lakes Dredge & Dock Corporation"
  },
  {
      "symbol": "GLF",
      "name": "GulfMark Offshore, Inc."
  },
  {
      "symbol": "GLGL",
      "name": "GLG Life Tech Corp"
  },
  {
      "symbol": "GLNG",
      "name": "Golar LNG Limited"
  },
  {
      "symbol": "GLO",
      "name": "Clough Global Opportunities Fund"
  },
  {
      "symbol": "GLOG",
      "name": "GasLog Ltd."
  },
  {
      "symbol": "GLOW",
      "name": "Glowpoint, Inc."
  },
  {
      "symbol": "GLP",
      "name": "Global Partners LP"
  },
  {
      "symbol": "GLPW",
      "name": "Global Power Equipment Group Inc"
  },
  {
      "symbol": "GLQ",
      "name": "Clough Global Equity Fund"
  },
  {
      "symbol": "GLRE",
      "name": "Greenlight Reinsurance, Ltd."
  },
  {
      "symbol": "GLT",
      "name": "Glatfelter"
  },
  {
      "symbol": "GLU",
      "name": "Gabelli Global Utility"
  },
  {
      "symbol": "GLUU",
      "name": "Glu Mobile Inc."
  },
  {
      "symbol": "GLV",
      "name": "Clough Global Allocation Fund"
  },
  {
      "symbol": "GLW",
      "name": "Corning Incorporated"
  },
  {
      "symbol": "GM",
      "name": "General Motors Company"
  },
  {
      "symbol": "GM/WS/A",
      "name": "General Motors Company"
  },
  {
      "symbol": "GM/WS/B",
      "name": "General Motors Company"
  },
  {
      "symbol": "GM^B",
      "name": "General Motors Company"
  },
  {
      "symbol": "GMA",
      "name": "GMAC LLC"
  },
  {
      "symbol": "GMAN",
      "name": "Gordmans Stores, Inc."
  },
  {
      "symbol": "GMCR",
      "name": "Green Mountain Coffee Roasters, Inc."
  },
  {
      "symbol": "GME",
      "name": "Gamestop Corporation"
  },
  {
      "symbol": "GMET",
      "name": "GeoMet, Inc."
  },
  {
      "symbol": "GMETP",
      "name": "GeoMet, Inc."
  },
  {
      "symbol": "GMK",
      "name": "GRUMA, S.A. de C.V."
  },
  {
      "symbol": "GMLP",
      "name": "Golar LNG Partners LP"
  },
  {
      "symbol": "GMO",
      "name": "General Moly, Inc"
  },
  {
      "symbol": "GMT",
      "name": "GATX Corporation"
  },
  {
      "symbol": "GMT^",
      "name": "GATX Corporation"
  },
  {
      "symbol": "GMXR",
      "name": "GMX Resources, Inc."
  },
  {
      "symbol": "GMXR^",
      "name": "GMX Resources, Inc."
  },
  {
      "symbol": "GNC",
      "name": "GNC Holdings, Inc."
  },
  {
      "symbol": "GNCMA",
      "name": "General Communication, Inc."
  },
  {
      "symbol": "GNE",
      "name": "Genie Energy Ltd."
  },
  {
      "symbol": "GNI",
      "name": "Great Northern Iron Ore Properties"
  },
  {
      "symbol": "GNK",
      "name": "Genco Shipping & Trading Limited"
  },
  {
      "symbol": "GNMA",
      "name": "iShares Trust iShares Barclays GNMA Bond Fund"
  },
  {
      "symbol": "GNMK",
      "name": "GenMark Diagnostics, Inc."
  },
  {
      "symbol": "GNOM",
      "name": "Complete Genomics, Inc."
  },
  {
      "symbol": "GNRC",
      "name": "Generac Holdlings Inc."
  },
  {
      "symbol": "GNT",
      "name": "GAMCO Natural Resources, Gold & Income Tust by Gabelli"
  },
  {
      "symbol": "GNTX",
      "name": "Gentex Corporation"
  },
  {
      "symbol": "GNVC",
      "name": "GenVec, Inc."
  },
  {
      "symbol": "GNW",
      "name": "Genworth Financial Inc"
  },
  {
      "symbol": "GOF",
      "name": "Guggenheim Strategic Opportunities Fund"
  },
  {
      "symbol": "GOK",
      "name": "Geokinetics, Inc."
  },
  {
      "symbol": "GOL",
      "name": "Gol Linhas Aereas Inteligentes S.A."
  },
  {
      "symbol": "GOLD",
      "name": "Randgold Resources Limited"
  },
  {
      "symbol": "GOLF",
      "name": "Golfsmith International Holdings, Inc."
  },
  {
      "symbol": "GOM",
      "name": "GMAC LLC"
  },
  {
      "symbol": "GOOD",
      "name": "Gladstone Commercial Corporation"
  },
  {
      "symbol": "GOODN",
      "name": "Gladstone Commercial Corporation"
  },
  {
      "symbol": "GOODO",
      "name": "Gladstone Commercial Corporation"
  },
  {
      "symbol": "GOODP",
      "name": "Gladstone Commercial Corporation"
  },
  {
      "symbol": "GOOG",
      "name": "Google Inc."
  },
  {
      "symbol": "GORO",
      "name": "Gold Resource Corporation"
  },
  {
      "symbol": "GOV",
      "name": "Government Properties Income Trust"
  },
  {
      "symbol": "GPC",
      "name": "Genuine Parts Company"
  },
  {
      "symbol": "GPE^A",
      "name": "Georgia Power Company"
  },
  {
      "symbol": "GPI",
      "name": "Group 1 Automotive, Inc."
  },
  {
      "symbol": "GPIC",
      "name": "Gaming Partners International Corporation"
  },
  {
      "symbol": "GPK",
      "name": "Graphic Packaging Holding Company"
  },
  {
      "symbol": "GPL",
      "name": "Great Panther Silver Limited"
  },
  {
      "symbol": "GPM",
      "name": "Guggenheim Enhanced Equity Income Fund"
  },
  {
      "symbol": "GPN",
      "name": "Global Payments Inc."
  },
  {
      "symbol": "GPOR",
      "name": "Gulfport Energy Corporation"
  },
  {
      "symbol": "GPR",
      "name": "GeoPetro Resources Co"
  },
  {
      "symbol": "GPRC",
      "name": "Guanwei Recycling Corp."
  },
  {
      "symbol": "GPRE",
      "name": "Green Plains Renewable Energy, Inc."
  },
  {
      "symbol": "GPRO",
      "name": "Gen-Probe Incorporated"
  },
  {
      "symbol": "GPS",
      "name": "Gap, Inc. (The)"
  },
  {
      "symbol": "GPX",
      "name": "GP Strategies Corporation"
  },
  {
      "symbol": "GR",
      "name": "Goodrich Corporation (The)"
  },
  {
      "symbol": "GRA",
      "name": "W.R. Grace & Co."
  },
  {
      "symbol": "GRC",
      "name": "Gorman-Rupp Company (The)"
  },
  {
      "symbol": "GRF",
      "name": "Eagle Capital Growth Fund, Inc."
  },
  {
      "symbol": "GRFS",
      "name": "Grifols, S.A."
  },
  {
      "symbol": "GRH",
      "name": "GreenHunter Energy Inc"
  },
  {
      "symbol": "GRID",
      "name": "First Trust NASDAQ Clean Edge Smart Grid Infrastructure Index "
  },
  {
      "symbol": "GRIF",
      "name": "Griffin Land & Nurseries, Inc."
  },
  {
      "symbol": "GRMH",
      "name": "GrayMark Healthcare, Inc."
  },
  {
      "symbol": "GRMN",
      "name": "Garmin Ltd."
  },
  {
      "symbol": "GRNB",
      "name": "Green Bankshares, Inc."
  },
  {
      "symbol": "GRO",
      "name": "Agria Corporation"
  },
  {
      "symbol": "GROW",
      "name": "U.S. Global Investors, Inc."
  },
  {
      "symbol": "GRPN",
      "name": "Groupon, Inc."
  },
  {
      "symbol": "GRR",
      "name": "Asia Tigers Fund, Inc. (The)"
  },
  {
      "symbol": "GRT",
      "name": "Glimcher Realty Trust"
  },
  {
      "symbol": "GRT^F",
      "name": "Glimcher Realty Trust"
  },
  {
      "symbol": "GRT^G",
      "name": "Glimcher Realty Trust"
  },
  {
      "symbol": "GRVY",
      "name": "GRAVITY Co., Ltd."
  },
  {
      "symbol": "GRX",
      "name": "The Gabelli Healthcare & Wellness Trust"
  },
  {
      "symbol": "GRX^A",
      "name": "The Gabelli Healthcare & Wellness Trust"
  },
  {
      "symbol": "GRZ",
      "name": "Gold Reserve Inc"
  },
  {
      "symbol": "GS",
      "name": "Goldman Sachs Group, Inc. (The)"
  },
  {
      "symbol": "GS^A",
      "name": "Goldman Sachs Group, Inc. (The)"
  },
  {
      "symbol": "GS^B",
      "name": "Goldman Sachs Group, Inc. (The)"
  },
  {
      "symbol": "GS^C",
      "name": "Goldman Sachs Group, Inc. (The)"
  },
  {
      "symbol": "GS^D",
      "name": "Goldman Sachs Group, Inc. (The)"
  },
  {
      "symbol": "GSAT",
      "name": "Globalstar, Inc."
  },
  {
      "symbol": "GSB",
      "name": "GlobalSCAPE, Inc."
  },
  {
      "symbol": "GSBC",
      "name": "Great Southern Bancorp, Inc."
  },
  {
      "symbol": "GSE",
      "name": "GSE Holding, Inc."
  },
  {
      "symbol": "GSF",
      "name": "Goldman Sachs Group, Inc. (The)"
  },
  {
      "symbol": "GSH",
      "name": "Guangshen Railway Company Limited"
  },
  {
      "symbol": "GSI",
      "name": "General Steel Holdings, Inc."
  },
  {
      "symbol": "GSIG",
      "name": "GSI Group, Inc."
  },
  {
      "symbol": "GSIT",
      "name": "GSI Technology, Inc."
  },
  {
      "symbol": "GSJ",
      "name": "Goldman Sachs Group, Inc. (The)"
  },
  {
      "symbol": "GSJK",
      "name": "Compressco Partners, L.P."
  },
  {
      "symbol": "GSK",
      "name": "GlaxoSmithKline PLC"
  },
  {
      "symbol": "GSL",
      "name": "Global Ship Lease, Inc."
  },
  {
      "symbol": "GSM",
      "name": "Globe Specialty Metals Inc."
  },
  {
      "symbol": "GSOL",
      "name": "Global Sources Ltd."
  },
  {
      "symbol": "GSS",
      "name": "Golden Star Resources, Ltd"
  },
  {
      "symbol": "GST",
      "name": "Gastar Exploration"
  },
  {
      "symbol": "GST^A",
      "name": "Gastar Exploration"
  },
  {
      "symbol": "GSVC",
      "name": "GSV Capital Corp"
  },
  {
      "symbol": "GSX",
      "name": "GASCO ENERGY INC"
  },
  {
      "symbol": "GT",
      "name": "Goodyear Tire & Rubber Company (The)"
  },
  {
      "symbol": "GT^A",
      "name": "Goodyear Tire & Rubber Company (The)"
  },
  {
      "symbol": "GTAT",
      "name": "GT Advanced Technologies, Inc."
  },
  {
      "symbol": "GTE",
      "name": "Gran Tierra Energy Inc."
  },
  {
      "symbol": "GTI",
      "name": "GrafTech International Ltd"
  },
  {
      "symbol": "GTIM",
      "name": "Good Times Restaurants Inc."
  },
  {
      "symbol": "GTIV",
      "name": "Gentiva Health Services, Inc."
  },
  {
      "symbol": "GTLS",
      "name": "Chart Industries, Inc."
  },
  {
      "symbol": "GTN",
      "name": "Gray Television, Inc."
  },
  {
      "symbol": "GTN/A",
      "name": "Gray Television, Inc."
  },
  {
      "symbol": "GTS",
      "name": "Triple-S Management Corporation"
  },
  {
      "symbol": "GTSI",
      "name": "GTSI Corp."
  },
  {
      "symbol": "GTU",
      "name": "Central Gold Trust"
  },
  {
      "symbol": "GTXI",
      "name": "GTx, Inc."
  },
  {
      "symbol": "GTY",
      "name": "Getty Realty Corporation"
  },
  {
      "symbol": "GU",
      "name": "Gushan Environmental Energy Limited"
  },
  {
      "symbol": "GUA",
      "name": "Gulf Power Company"
  },
  {
      "symbol": "GUID",
      "name": "Guidance Software, Inc."
  },
  {
      "symbol": "GUL",
      "name": "Gulf Power Company"
  },
  {
      "symbol": "GULF",
      "name": "WisdomTree Middle East Dividend Fund"
  },
  {
      "symbol": "GURE",
      "name": "Gulf Resources, Inc."
  },
  {
      "symbol": "GUT",
      "name": "Gabelli Utility Trust (The)"
  },
  {
      "symbol": "GUT^A",
      "name": "Gabelli Utility Trust (The)"
  },
  {
      "symbol": "GV",
      "name": "Goldfield Corporation (The)"
  },
  {
      "symbol": "GVA",
      "name": "Granite Construction Incorporated"
  },
  {
      "symbol": "GVP",
      "name": "GSE Systems, Inc."
  },
  {
      "symbol": "GWAY",
      "name": "Greenway Medical Technologies, Inc."
  },
  {
      "symbol": "GWF",
      "name": "Wells Fargo & Company"
  },
  {
      "symbol": "GWR",
      "name": "Genesee & Wyoming, Inc."
  },
  {
      "symbol": "GWRE",
      "name": "Guidewire Software, Inc."
  },
  {
      "symbol": "GWW",
      "name": "W.W. Grainger, Inc."
  },
  {
      "symbol": "GXP",
      "name": "Great Plains Energy Inc"
  },
  {
      "symbol": "GXP^A",
      "name": "Great Plains Energy Inc"
  },
  {
      "symbol": "GXP^D",
      "name": "Great Plains Energy Inc"
  },
  {
      "symbol": "GXP^E",
      "name": "Great Plains Energy Inc"
  },
  {
      "symbol": "GXP^F",
      "name": "Great Plains Energy Inc"
  },
  {
      "symbol": "GY",
      "name": "GenCorp Inc."
  },
  {
      "symbol": "GYA",
      "name": "Corporate Asset Backed Corp CABCO"
  },
  {
      "symbol": "GYB",
      "name": "CABCO Series 2004-101 Trust"
  },
  {
      "symbol": "GYC",
      "name": "Corporate Asset Backed Corp CABCO"
  },
  {
      "symbol": "GYRO",
      "name": "Gyrodyne Company of America, Inc."
  },
  {
      "symbol": "GZT",
      "name": "Gazit-Globe Ltd."
  },
  {
      "symbol": "H",
      "name": "Hyatt Hotels Corporation"
  },
  {
      "symbol": "HA",
      "name": "Hawaiian Holdings, Inc."
  },
  {
      "symbol": "HAE",
      "name": "Haemonetics Corporation"
  },
  {
      "symbol": "HAFC",
      "name": "Hanmi Financial Corporation"
  },
  {
      "symbol": "HAIN",
      "name": "The Hain Celestial Group, Inc."
  },
  {
      "symbol": "HAL",
      "name": "Halliburton Company"
  },
  {
      "symbol": "HALL",
      "name": "Hallmark Financial Services, Inc."
  },
  {
      "symbol": "HALO",
      "name": "Halozyme Therapeutics, Inc."
  },
  {
      "symbol": "HAR",
      "name": "Harman International Industries, Incorporated"
  },
  {
      "symbol": "HARL",
      "name": "Harleysville Savings Bank"
  },
  {
      "symbol": "HAS",
      "name": "Hasbro, Inc."
  },
  {
      "symbol": "HAST",
      "name": "Hastings Entertainment, Inc."
  },
  {
      "symbol": "HAUP",
      "name": "Hauppauge Digital, Inc."
  },
  {
      "symbol": "HAV",
      "name": "Helios Advantage Income Fund, Inc."
  },
  {
      "symbol": "HAVNP",
      "name": "New York Community Bancorp, Inc."
  },
  {
      "symbol": "HAYN",
      "name": "Haynes International, Inc."
  },
  {
      "symbol": "HBA^D",
      "name": "HSBC USA, Inc."
  },
  {
      "symbol": "HBA^F",
      "name": "HSBC USA, Inc."
  },
  {
      "symbol": "HBA^G",
      "name": "HSBC USA, Inc."
  },
  {
      "symbol": "HBA^H",
      "name": "HSBC USA, Inc."
  },
  {
      "symbol": "HBA^Z",
      "name": "HSBC USA, Inc."
  },
  {
      "symbol": "HBAN",
      "name": "Huntington Bancshares Incorporated"
  },
  {
      "symbol": "HBANP",
      "name": "Huntington Bancshares Incorporated"
  },
  {
      "symbol": "HBC",
      "name": "HSBC Holdings plc"
  },
  {
      "symbol": "HBC^",
      "name": "HSBC Holdings plc"
  },
  {
      "symbol": "HBC^A",
      "name": "HSBC Holdings plc"
  },
  {
      "symbol": "HBCP",
      "name": "Home Bancorp, Inc."
  },
  {
      "symbol": "HBHC",
      "name": "Hancock Holding Company"
  },
  {
      "symbol": "HBI",
      "name": "Hanesbrands Inc."
  },
  {
      "symbol": "HBIO",
      "name": "Harvard Bioscience, Inc."
  },
  {
      "symbol": "HBM",
      "name": "HudBay Minerals Inc"
  },
  {
      "symbol": "HBNC",
      "name": "Horizon Bancorp (IN)"
  },
  {
      "symbol": "HBNK",
      "name": "Hampden Bancorp, Inc."
  },
  {
      "symbol": "HBOS",
      "name": "Heritage Financial Group"
  },
  {
      "symbol": "HBP",
      "name": "Helix Biopherma Cp"
  },
  {
      "symbol": "HCA",
      "name": "HCA Holdings, Inc."
  },
  {
      "symbol": "HCBK",
      "name": "Hudson City Bancorp, Inc."
  },
  {
      "symbol": "HCC",
      "name": "HCC Insurance Holdings, Inc."
  },
  {
      "symbol": "HCCI",
      "name": "Heritage-Crystal Clean, Inc."
  },
  {
      "symbol": "HCF",
      "name": "Pyxis Credit Stategies Fund"
  },
  {
      "symbol": "HCII",
      "name": "Homeowners Choice, Inc."
  },
  {
      "symbol": "HCIIP",
      "name": "Homeowners Choice, Inc."
  },
  {
      "symbol": "HCIIW",
      "name": "Homeowners Choice, Inc."
  },
  {
      "symbol": "HCKT",
      "name": "The Hackett Group, Inc."
  },
  {
      "symbol": "HCN",
      "name": "Health Care REIT, Inc."
  },
  {
      "symbol": "HCN^I",
      "name": "Health Care REIT, Inc."
  },
  {
      "symbol": "HCN^J",
      "name": "Health Care REIT, Inc."
  },
  {
      "symbol": "HCOM",
      "name": "Hawaiian Telcom Holdco, Inc."
  },
  {
      "symbol": "HCP",
      "name": "HCP, Inc."
  },
  {
      "symbol": "HCS",
      "name": "HSBC Holdings plc"
  },
  {
      "symbol": "HCS^B",
      "name": "HSBC Holdings plc"
  },
  {
      "symbol": "HCSG",
      "name": "Healthcare Services Group, Inc."
  },
  {
      "symbol": "HD",
      "name": "Home Depot, Inc. (The)"
  },
  {
      "symbol": "HDB",
      "name": "HDFC Bank Limited"
  },
  {
      "symbol": "HDNG",
      "name": "Hardinge, Inc."
  },
  {
      "symbol": "HDSN",
      "name": "Hudson Technologies, Inc."
  },
  {
      "symbol": "HDY",
      "name": "HyperDynamics Corporation"
  },
  {
      "symbol": "HE",
      "name": "Hawaiian Electric Industries, Inc."
  },
  {
      "symbol": "HE^U",
      "name": "Hawaiian Electric Industries, Inc."
  },
  {
      "symbol": "HEAT",
      "name": "SmartHeat Inc."
  },
  {
      "symbol": "HEB",
      "name": "Hemispherx BioPharma, Inc."
  },
  {
      "symbol": "HEES",
      "name": "H&E Equipment Services, Inc."
  },
  {
      "symbol": "HEI",
      "name": "Heico Corporation"
  },
  {
      "symbol": "HEI/A",
      "name": "Heico Corporation"
  },
  {
      "symbol": "HEK",
      "name": "Heckmann Corporation"
  },
  {
      "symbol": "HELE",
      "name": "Helen of Troy Limited"
  },
  {
      "symbol": "HEOP",
      "name": "Heritage Oaks Bancorp"
  },
  {
      "symbol": "HEP",
      "name": "Holly Energy Partners, L.P."
  },
  {
      "symbol": "HEQ",
      "name": "John Hancock Hedged Equity & Income Fund"
  },
  {
      "symbol": "HERO",
      "name": "Hercules Offshore, Inc."
  },
  {
      "symbol": "HES",
      "name": "Hess Corporation"
  },
  {
      "symbol": "HF",
      "name": "HFF, Inc."
  },
  {
      "symbol": "HFBC",
      "name": "HopFed Bancorp, Inc."
  },
  {
      "symbol": "HFBL",
      "name": "Home Federal Bancorp, Inc. of Louisiana"
  },
  {
      "symbol": "HFC",
      "name": "HollyFrontier Corporation"
  },
  {
      "symbol": "HFFC",
      "name": "HF Financial Corp."
  },
  {
      "symbol": "HFWA",
      "name": "Heritage Financial Corporation"
  },
  {
      "symbol": "HGG",
      "name": "HHGregg, Inc."
  },
  {
      "symbol": "HGH",
      "name": "Hartford Financial Services Group, Inc. (The)"
  },
  {
      "symbol": "HGR",
      "name": "Hanger Orthopedic Group, Inc."
  },
  {
      "symbol": "HGSH",
      "name": "China HGS Real Estate, Inc."
  },
  {
      "symbol": "HGSI",
      "name": "Human Genome Sciences, Inc."
  },
  {
      "symbol": "HGT",
      "name": "Hugoton Royalty Trust"
  },
  {
      "symbol": "HH",
      "name": "Hooper Holmes, Inc."
  },
  {
      "symbol": "HHC",
      "name": "Howard Hughes Corporation (The)"
  },
  {
      "symbol": "HHS",
      "name": "Harte-Hanks, Inc."
  },
  {
      "symbol": "HHY",
      "name": "Helios High Yield Fund"
  },
  {
      "symbol": "HI",
      "name": "Hillenbrand Inc"
  },
  {
      "symbol": "HIBB",
      "name": "Hibbett Sports, Inc."
  },
  {
      "symbol": "HIF",
      "name": "Western Asset High Income Fund Inc."
  },
  {
      "symbol": "HIFS",
      "name": "Hingham Institution for Savings"
  },
  {
      "symbol": "HIG",
      "name": "Hartford Financial Services Group, Inc. (The)"
  },
  {
      "symbol": "HIG/WS",
      "name": "Hartford Financial Services Group, Inc. (The)"
  },
  {
      "symbol": "HIG^A",
      "name": "Hartford Financial Services Group, Inc. (The)"
  },
  {
      "symbol": "HIH",
      "name": "Helios High Income Fund, Inc"
  },
  {
      "symbol": "HIHO",
      "name": "Highway Holdings Limited"
  },
  {
      "symbol": "HII",
      "name": "Huntington Ingalls Industries, Inc."
  },
  {
      "symbol": "HIL",
      "name": "Hill International, Inc."
  },
  {
      "symbol": "HILL",
      "name": "Dot Hill Systems Corporation"
  },
  {
      "symbol": "HIMX",
      "name": "Himax Technologies, Inc."
  },
  {
      "symbol": "HIO",
      "name": "Western Asset High Income Opportunity Fund, Inc."
  },
  {
      "symbol": "HIS",
      "name": "CIGNA High Income Shares"
  },
  {
      "symbol": "HITK",
      "name": "Hi-Tech Pharmacal Co., Inc."
  },
  {
      "symbol": "HITT",
      "name": "Hittite Microwave Corporation"
  },
  {
      "symbol": "HIW",
      "name": "Highwoods Properties, Inc."
  },
  {
      "symbol": "HIX",
      "name": "Western Asset High Income Fund II Inc."
  },
  {
      "symbol": "HJA",
      "name": "MS Structured Asset Corp Saturns GE Cap Corp Series 2002-14"
  },
  {
      "symbol": "HJG",
      "name": "MS Structured Asset Corp Saturns GE Cap Corp Series 2002-14"
  },
  {
      "symbol": "HJJ",
      "name": "MS Structured Asset Corp SATURNS Goldman Sachs"
  },
  {
      "symbol": "HJL",
      "name": "MS Structured Asset Corp Saturns GE Cap Corp Series 2002-14"
  },
  {
      "symbol": "HJN",
      "name": "MS Structured Asset Corp Saturns GE Cap Corp Series 2002-14"
  },
  {
      "symbol": "HJO",
      "name": "MS Structured Asset Corp Saturns GE Cap Corp Series 2002-14"
  },
  {
      "symbol": "HJR",
      "name": "MS Structured Asset Corp."
  },
  {
      "symbol": "HJT",
      "name": "MS Structured Asset Corp Saturns GE Cap Corp Series 2002-14"
  },
  {
      "symbol": "HJV",
      "name": "MS Structured Asset Corp Saturns GE Cap Corp Series 2002-14"
  },
  {
      "symbol": "HK",
      "name": "Halcon Resources Corporation"
  },
  {
      "symbol": "HKAC",
      "name": "Hicks Acquisition Company II, Inc."
  },
  {
      "symbol": "HKACU",
      "name": "Hicks Acquisition Company II, Inc."
  },
  {
      "symbol": "HKACW",
      "name": "Hicks Acquisition Company II, Inc."
  },
  {
      "symbol": "HKN",
      "name": "HKN, Inc."
  },
  {
      "symbol": "HL",
      "name": "Hecla Mining Company"
  },
  {
      "symbol": "HL^B",
      "name": "Hecla Mining Company"
  },
  {
      "symbol": "HLF",
      "name": "Herbalife LTD."
  },
  {
      "symbol": "HLIT",
      "name": "Harmonic Inc."
  },
  {
      "symbol": "HLM^",
      "name": "Hillman Group Capital Trust"
  },
  {
      "symbol": "HLS",
      "name": "HealthSouth Corporation"
  },
  {
      "symbol": "HLSS",
      "name": "Home Loan Servicing Solutions, Ltd."
  },
  {
      "symbol": "HLX",
      "name": "Helix Energy Solutions Group, Inc."
  },
  {
      "symbol": "HLYS",
      "name": "Heelys, Inc."
  },
  {
      "symbol": "HMA",
      "name": "Health Management Associates, Inc."
  },
  {
      "symbol": "HMC",
      "name": "Honda Motor Company, Ltd."
  },
  {
      "symbol": "HME",
      "name": "Home Properties, Inc."
  },
  {
      "symbol": "HMG",
      "name": "HMG/Courtland Properties, Inc."
  },
  {
      "symbol": "HMH",
      "name": "Helios Multi-Sector High Income Fund, Inc."
  },
  {
      "symbol": "HMIN",
      "name": "Home Inns & Hotels Management Inc."
  },
  {
      "symbol": "HMN",
      "name": "Horace Mann Educators Corporation"
  },
  {
      "symbol": "HMNF",
      "name": "HMN Financial, Inc."
  },
  {
      "symbol": "HMNY",
      "name": "Helios & Matheson Information Technology Inc"
  },
  {
      "symbol": "HMPR",
      "name": "Hampton Roads Bankshares Inc"
  },
  {
      "symbol": "HMST",
      "name": "HomeStreet, Inc."
  },
  {
      "symbol": "HMSY",
      "name": "HMS Holdings Corp"
  },
  {
      "symbol": "HMY",
      "name": "Harmony Gold Mining Co. Ltd."
  },
  {
      "symbol": "HNH",
      "name": "Handy & Harman Ltd."
  },
  {
      "symbol": "HNI",
      "name": "HON INDUSTRIES Inc."
  },
  {
      "symbol": "HNP",
      "name": "Huaneng Power Intl"
  },
  {
      "symbol": "HNR",
      "name": "Harvest Natural Resources Inc"
  },
  {
      "symbol": "HNRG",
      "name": "Hallador Energy Company"
  },
  {
      "symbol": "HNSN",
      "name": "Hansen Medical, Inc."
  },
  {
      "symbol": "HNT",
      "name": "Health Net Inc."
  },
  {
      "symbol": "HNW",
      "name": "Pioneer Diversified High Income Trust"
  },
  {
      "symbol": "HNZ",
      "name": "H.J. Heinz Company"
  },
  {
      "symbol": "HNZ^",
      "name": "H.J. Heinz Company"
  },
  {
      "symbol": "HOFT",
      "name": "Hooker Furniture Corporation"
  },
  {
      "symbol": "HOG",
      "name": "Harley-Davidson, Inc."
  },
  {
      "symbol": "HOGS",
      "name": "Zhongpin Inc."
  },
  {
      "symbol": "HOKU",
      "name": "Hoku Corporation"
  },
  {
      "symbol": "HOLI",
      "name": "Hollysys Automation Technologies, Ltd."
  },
  {
      "symbol": "HOLL",
      "name": "Hollywood Media Corp."
  },
  {
      "symbol": "HOLX",
      "name": "Hologic, Inc."
  },
  {
      "symbol": "HOMB",
      "name": "Home BancShares, Inc."
  },
  {
      "symbol": "HOME",
      "name": "Home Federal Bancorp, Inc."
  },
  {
      "symbol": "HON",
      "name": "Honeywell International Inc."
  },
  {
      "symbol": "HOS",
      "name": "Hornbeck Offshore Services"
  },
  {
      "symbol": "HOT",
      "name": "Starwood Hotels & Resorts Worldwide, Inc."
  },
  {
      "symbol": "HOTT",
      "name": "Hot Topic, Inc."
  },
  {
      "symbol": "HOV",
      "name": "Hovnanian Enterprises Inc"
  },
  {
      "symbol": "HOVNP",
      "name": "Hovnanian Enterprises Inc"
  },
  {
      "symbol": "HOVU",
      "name": "Hovnanian Enterprises Inc"
  },
  {
      "symbol": "HP",
      "name": "Helmerich & Payne, Inc."
  },
  {
      "symbol": "HPCCP",
      "name": "Huntington Preferred Capital, Inc."
  },
  {
      "symbol": "HPF",
      "name": "John Hancock Pfd Income Fund II"
  },
  {
      "symbol": "HPI",
      "name": "John Hancock Preferred Income Fund"
  },
  {
      "symbol": "HPJ",
      "name": "Hong Kong Highpower Technology"
  },
  {
      "symbol": "HPOL",
      "name": "Harris Interactive, Inc."
  },
  {
      "symbol": "HPP",
      "name": "Hudson Pacific Properties, Inc."
  },
  {
      "symbol": "HPP^B",
      "name": "Hudson Pacific Properties, Inc."
  },
  {
      "symbol": "HPQ",
      "name": "Hewlett-Packard Company"
  },
  {
      "symbol": "HPS",
      "name": "John Hancock Preferred Income Fund III"
  },
  {
      "symbol": "HPT",
      "name": "Hospitality Properites Trust"
  },
  {
      "symbol": "HPT^C",
      "name": "Hospitality Properites Trust"
  },
  {
      "symbol": "HPT^D",
      "name": "Hospitality Properites Trust"
  },
  {
      "symbol": "HPY",
      "name": "Heartland Payment Systems, Inc."
  },
  {
      "symbol": "HQH",
      "name": "H&Q Healthcare Investors"
  },
  {
      "symbol": "HQL",
      "name": "H&Q Life Sciences Investors"
  },
  {
      "symbol": "HR",
      "name": "Healthcare Realty Trust Incorporated"
  },
  {
      "symbol": "HRB",
      "name": "H&R Block, Inc."
  },
  {
      "symbol": "HRC",
      "name": "Hill-Rom Holdings Inc"
  },
  {
      "symbol": "HRG",
      "name": "Harbinger Group Inc"
  },
  {
      "symbol": "HRL",
      "name": "Hormel Foods Corporation"
  },
  {
      "symbol": "HRS",
      "name": "Harris Corporation"
  },
  {
      "symbol": "HRT",
      "name": "Arrhythmia Research Technology Inc."
  },
  {
      "symbol": "HRZN",
      "name": "Horizon Technology Finance Corporation"
  },
  {
      "symbol": "HSA",
      "name": "Helios Strategic Income Fd, Inc"
  },
  {
      "symbol": "HSBC^B",
      "name": "Household Finance Corp"
  },
  {
      "symbol": "HSC",
      "name": "Harsco Corporation"
  },
  {
      "symbol": "HSFT",
      "name": "HiSoft Technology International Limited"
  },
  {
      "symbol": "HSIC",
      "name": "Henry Schein, Inc."
  },
  {
      "symbol": "HSII",
      "name": "Heidrick & Struggles International, Inc."
  },
  {
      "symbol": "HSKA",
      "name": "Heska Corporation"
  },
  {
      "symbol": "HSNI",
      "name": "HSN, Inc."
  },
  {
      "symbol": "HSOL",
      "name": "Hanwha SolarOne Co., Ltd."
  },
  {
      "symbol": "HSON",
      "name": "Hudson Global, Inc."
  },
  {
      "symbol": "HSP",
      "name": "Hospira Inc"
  },
  {
      "symbol": "HST",
      "name": "Host Marriott Financial Trust"
  },
  {
      "symbol": "HSTM",
      "name": "HealthStream, Inc."
  },
  {
      "symbol": "HSY",
      "name": "Hershey Company (The)"
  },
  {
      "symbol": "HT",
      "name": "Hersha Hospitality Trust"
  },
  {
      "symbol": "HT^A",
      "name": "Hersha Hospitality Trust"
  },
  {
      "symbol": "HT^B",
      "name": "Hersha Hospitality Trust"
  },
  {
      "symbol": "HTBK",
      "name": "Heritage Commerce Corp"
  },
  {
      "symbol": "HTCH",
      "name": "Hutchinson Technology Incorporated"
  },
  {
      "symbol": "HTCO",
      "name": "Hickory Tech Corporation"
  },
  {
      "symbol": "HTD",
      "name": "John Hancock Tax Advantaged Dividend Income Fund"
  },
  {
      "symbol": "HTF",
      "name": "Horizon Technology Finance Corporation"
  },
  {
      "symbol": "HTGC",
      "name": "Hercules Technology Growth Capital, Inc."
  },
  {
      "symbol": "HTGZ",
      "name": "Hercules Technology Growth Capital, Inc."
  },
  {
      "symbol": "HTH",
      "name": "Hilltop Holdings Inc."
  },
  {
      "symbol": "HTHT",
      "name": "China Lodging Group, Limited"
  },
  {
      "symbol": "HTLD",
      "name": "Heartland Express, Inc."
  },
  {
      "symbol": "HTLF",
      "name": "Heartland Financial USA, Inc."
  },
  {
      "symbol": "HTM",
      "name": "U.S. Geothermal Inc."
  },
  {
      "symbol": "HTR",
      "name": "Hyperion Brookfield Total Return Fund, Inc."
  },
  {
      "symbol": "HTS",
      "name": "Hatteras Financial Corp"
  },
  {
      "symbol": "HTSI",
      "name": "Harris Teeter Supermarkets, Inc."
  },
  {
      "symbol": "HTWR",
      "name": "Heartware International, Inc."
  },
  {
      "symbol": "HTY",
      "name": "John Hancock Tax-Advantaged Global Shareholder Yield Fund"
  },
  {
      "symbol": "HTZ",
      "name": "Hertz Global Holdings, Inc"
  },
  {
      "symbol": "HUB/A",
      "name": "Hubbell Inc A"
  },
  {
      "symbol": "HUB/B",
      "name": "Hubbell Inc A"
  },
  {
      "symbol": "HUBG",
      "name": "Hub Group, Inc."
  },
  {
      "symbol": "HUM",
      "name": "Humana Inc."
  },
  {
      "symbol": "HUN",
      "name": "Huntsman Corporation"
  },
  {
      "symbol": "HURC",
      "name": "Hurco Companies, Inc."
  },
  {
      "symbol": "HURN",
      "name": "Huron Consulting Group Inc."
  },
  {
      "symbol": "HUSA",
      "name": "Houston American Energy Corporation"
  },
  {
      "symbol": "HVB",
      "name": "Hudson Valley Holding Corp."
  },
  {
      "symbol": "HVT",
      "name": "Haverty Furniture Companies, Inc."
  },
  {
      "symbol": "HVT/A",
      "name": "Haverty Furniture Companies, Inc."
  },
  {
      "symbol": "HW",
      "name": "Headwaters Incorporated"
  },
  {
      "symbol": "HWAY",
      "name": "Healthways, Inc."
  },
  {
      "symbol": "HWBK",
      "name": "Hawthorn Bancshares, Inc."
  },
  {
      "symbol": "HWCC",
      "name": "Houston Wire & Cable Company"
  },
  {
      "symbol": "HWD",
      "name": "Harry Winston Diamond Corporation"
  },
  {
      "symbol": "HWG",
      "name": "Hallwood Group Incorporated"
  },
  {
      "symbol": "HWKN",
      "name": "Hawkins, Inc."
  },
  {
      "symbol": "HXL",
      "name": "Hexcel Corporation"
  },
  {
      "symbol": "HXM",
      "name": "Desarrolladora Homex"
  },
  {
      "symbol": "HYB",
      "name": "New America High Income Fund, Inc. (The)"
  },
  {
      "symbol": "HYF",
      "name": "Managed High Yield Plus Fund, Inc."
  },
  {
      "symbol": "HYGS",
      "name": "Hydrogenics Corporation"
  },
  {
      "symbol": "HYH",
      "name": "Lehman ABS Corporation"
  },
  {
      "symbol": "HYI",
      "name": "Western Asset High Yield Defined Opportunity Fund Inc."
  },
  {
      "symbol": "HYK",
      "name": "Lehman ABS Corporation"
  },
  {
      "symbol": "HYL",
      "name": "Lehman ABS Corporation"
  },
  {
      "symbol": "HYT",
      "name": "Blackrock Corporate High Yield Fund VI Inc"
  },
  {
      "symbol": "HYV",
      "name": "Blackrock Corporate High Yield Fund V Inc"
  },
  {
      "symbol": "HYY",
      "name": "Structured Products Corp 6.25 Verizon Gbl"
  },
  {
      "symbol": "HZD",
      "name": "Zion Oil & Gas Inc"
  },
  {
      "symbol": "HZK",
      "name": "Structured Products Corp 6.25 Verizon Gbl"
  },
  {
      "symbol": "HZNP",
      "name": "Horizon Pharma, Inc."
  },
  {
      "symbol": "HZO",
      "name": "MarineMax, Inc."
  },
  {
      "symbol": "IACI",
      "name": "IAC/InterActiveCorp"
  },
  {
      "symbol": "IAE",
      "name": "ING Asia Pacific High Dividend Equity Income Fund"
  },
  {
      "symbol": "IAF",
      "name": "Aberdeen Australia Equity Fund Inc"
  },
  {
      "symbol": "IAG",
      "name": "Iamgold Corporation"
  },
  {
      "symbol": "IART",
      "name": "Integra LifeSciences Holdings Corporation"
  },
  {
      "symbol": "IBA",
      "name": "Industrias Bachoco, S.A. de C.V."
  },
  {
      "symbol": "IBB",
      "name": "iShares NASDAQ Biotechnology Index Fund"
  },
  {
      "symbol": "IBCA",
      "name": "Intervest Bancshares Corp."
  },
  {
      "symbol": "IBCP",
      "name": "Independent Bank Corporation"
  },
  {
      "symbol": "IBCPO",
      "name": "Independent Bank Corporation"
  },
  {
      "symbol": "IBI",
      "name": "Interline Brands, Inc."
  },
  {
      "symbol": "IBIO",
      "name": "iBio, Inc."
  },
  {
      "symbol": "IBKC",
      "name": "IBERIABANK Corporation"
  },
  {
      "symbol": "IBKR",
      "name": "Interactive Brokers Group, Inc."
  },
  {
      "symbol": "IBM",
      "name": "International Business Machines Corporation"
  },
  {
      "symbol": "IBN",
      "name": "ICICI Bank Limited"
  },
  {
      "symbol": "IBO",
      "name": "IBO (Listing Market - NYSE Amex Network B F)"
  },
  {
      "symbol": "IBOC",
      "name": "International Bancshares Corporation"
  },
  {
      "symbol": "ICA",
      "name": "Empresas Ica Soc Contrladora"
  },
  {
      "symbol": "ICAD",
      "name": "icad inc."
  },
  {
      "symbol": "ICB",
      "name": "MS Income Securities, Inc."
  },
  {
      "symbol": "ICCC",
      "name": "ImmuCell Corporation"
  },
  {
      "symbol": "ICE",
      "name": "IntercontinentalExchange, Inc."
  },
  {
      "symbol": "ICFI",
      "name": "ICF International, Inc."
  },
  {
      "symbol": "ICGE",
      "name": "ICG Group, Inc."
  },
  {
      "symbol": "ICH",
      "name": "Investors Capital Holdings, Ltd."
  },
  {
      "symbol": "ICLN",
      "name": "iShares S&P Global Clean Energy Index Fund"
  },
  {
      "symbol": "ICLR",
      "name": "ICON plc"
  },
  {
      "symbol": "ICON",
      "name": "Iconix Brand Group, Inc."
  },
  {
      "symbol": "ICS",
      "name": "Invesco California Municipal Securities"
  },
  {
      "symbol": "ICUI",
      "name": "ICU Medical, Inc."
  },
  {
      "symbol": "IDA",
      "name": "IDACORP, Inc."
  },
  {
      "symbol": "IDCC",
      "name": "InterDigital, Inc."
  },
  {
      "symbol": "IDE",
      "name": "ING Infrastructure Industrial and Material Fund"
  },
  {
      "symbol": "IDG",
      "name": "ING Group, N.V."
  },
  {
      "symbol": "IDI",
      "name": "SearchMedia Holdings Limited"
  },
  {
      "symbol": "IDI/U",
      "name": "SearchMedia Holdings Limited"
  },
  {
      "symbol": "IDI/WS",
      "name": "SearchMedia Holdings Limited"
  },
  {
      "symbol": "IDIX",
      "name": "Idenix Pharmaceuticals, Inc."
  },
  {
      "symbol": "IDN",
      "name": "Intellicheck Mobilisia, Inc."
  },
  {
      "symbol": "IDRA",
      "name": "Idera Pharmaceuticals, Inc."
  },
  {
      "symbol": "IDSA",
      "name": "Industrial Services of America, Inc."
  },
  {
      "symbol": "IDSY",
      "name": "I.D. Systems, Inc."
  },
  {
      "symbol": "IDT",
      "name": "IDT Corporation"
  },
  {
      "symbol": "IDTI",
      "name": "Integrated Device Technology, Inc."
  },
  {
      "symbol": "IDXX",
      "name": "IDEXX Laboratories, Inc."
  },
  {
      "symbol": "IEC",
      "name": "IEC Electronics Corp."
  },
  {
      "symbol": "IEP",
      "name": "Icahn Enterprises L.P."
  },
  {
      "symbol": "IESC",
      "name": "Integrated Electrical Services, Inc."
  },
  {
      "symbol": "IEX",
      "name": "IDEX Corporation"
  },
  {
      "symbol": "IF",
      "name": "Aberdeen Indonesia Fund, Inc."
  },
  {
      "symbol": "IFAS",
      "name": "iShares FTSE EPRA/NAREIT Asia Index Fund"
  },
  {
      "symbol": "IFEU",
      "name": "iShares FTSE EPRA/NAREIT Europe Index Fund"
  },
  {
      "symbol": "IFF",
      "name": "Internationa Flavors & Fragrances, Inc."
  },
  {
      "symbol": "IFGL",
      "name": "iShares FTSE EPRA/NAREIT Global Real Estate ex-U.S. Index Fund"
  },
  {
      "symbol": "IFMI",
      "name": "Institutional Financial Markets, Inc."
  },
  {
      "symbol": "IFN",
      "name": "India Fund, Inc. (The)"
  },
  {
      "symbol": "IFNA",
      "name": "iShares FTSE EPRA/NAREIT North America Index Fund"
  },
  {
      "symbol": "IFON",
      "name": "InfoSonics Corp"
  },
  {
      "symbol": "IFSIA",
      "name": "Interface, Inc."
  },
  {
      "symbol": "IFSM",
      "name": "iShares FTSE Developed Small Cap ex-North America Index Fund"
  },
  {
      "symbol": "IFT",
      "name": "Imperial Holdings, Inc."
  },
  {
      "symbol": "IG",
      "name": "IGI Laboratories, Inc."
  },
  {
      "symbol": "IGA",
      "name": "ING Global Advantage and Premium Opportunity Fund"
  },
  {
      "symbol": "IGC",
      "name": "India Globalization Capital Inc."
  },
  {
      "symbol": "IGC/U",
      "name": "India Globalization Capital Inc."
  },
  {
      "symbol": "IGC/WS",
      "name": "India Globalization Capital Inc."
  },
  {
      "symbol": "IGD",
      "name": "ING Global Equity Dividend and Premium Opportunity Fund"
  },
  {
      "symbol": "IGI",
      "name": "Western Asset Investment Grade Defined Opportunity Trust Inc."
  },
  {
      "symbol": "IGK",
      "name": "ING Group, N.V."
  },
  {
      "symbol": "IGLD",
      "name": "Internet Gold Golden Lines Ltd."
  },
  {
      "symbol": "IGOI",
      "name": "iGo, Inc"
  },
  {
      "symbol": "IGOV",
      "name": "iShares S&P/Citigroup International Treasury Bond Fund"
  },
  {
      "symbol": "IGR",
      "name": "CBRE Clarion Global Real Estate Income Fund"
  },
  {
      "symbol": "IGT",
      "name": "International Game Technology"
  },
  {
      "symbol": "IGTE",
      "name": "iGATE Corporation"
  },
  {
      "symbol": "IHC",
      "name": "Independence Holding Company"
  },
  {
      "symbol": "IHD",
      "name": "ING Emerging Markets High Dividend Equity Fund"
  },
  {
      "symbol": "IHG",
      "name": "Intercontinental Hotels Group"
  },
  {
      "symbol": "IHS",
      "name": "IHS Inc."
  },
  {
      "symbol": "IHT",
      "name": "InnSuites Hospitality Trust"
  },
  {
      "symbol": "IIC",
      "name": "Invesco California Municipal Income Trust"
  },
  {
      "symbol": "IID",
      "name": "ING International High Dividend Equity Income Fund"
  },
  {
      "symbol": "IIF",
      "name": "Morgan Stanley India Investment Fund, Inc."
  },
  {
      "symbol": "III",
      "name": "Information Services Group, Inc."
  },
  {
      "symbol": "IIIN",
      "name": "Insteel Industries, Inc."
  },
  {
      "symbol": "IIJI",
      "name": "Internet Initiative Japan, Inc."
  },
  {
      "symbol": "IILG",
      "name": "Interval Leisure Group, Inc."
  },
  {
      "symbol": "IIM",
      "name": "Invesco Value Municipal Income Trust"
  },
  {
      "symbol": "IIN",
      "name": "IntriCon Corporation"
  },
  {
      "symbol": "IIT",
      "name": "PT Indosat Tbk"
  },
  {
      "symbol": "IIVI",
      "name": "II-VI Incorporated"
  },
  {
      "symbol": "IIZ^K",
      "name": "SiM Internal Test 5"
  },
  {
      "symbol": "IKAN",
      "name": "Ikanos Communications, Inc."
  },
  {
      "symbol": "IKJ",
      "name": "Bank of America Corporation"
  },
  {
      "symbol": "IKL",
      "name": "Bank of America Corporation"
  },
  {
      "symbol": "IKM",
      "name": "Bank of America Corporation"
  },
  {
      "symbol": "IKNX",
      "name": "Ikonics Corporation"
  },
  {
      "symbol": "IKR",
      "name": "Bank of America Corporation"
  },
  {
      "symbol": "IL",
      "name": "IntraLinks Holdings, Inc."
  },
  {
      "symbol": "ILMN",
      "name": "Illumina, Inc."
  },
  {
      "symbol": "IM",
      "name": "Ingram Micro Inc."
  },
  {
      "symbol": "IMAX",
      "name": "Imax Corporation"
  },
  {
      "symbol": "IMC",
      "name": "Invesco Value Municipal Bond Trust"
  },
  {
      "symbol": "IMF",
      "name": "Western Asset Inflation Management Fund Inc"
  },
  {
      "symbol": "IMGN",
      "name": "ImmunoGen, Inc."
  },
  {
      "symbol": "IMH",
      "name": "Impac Mortgage Holdings, Inc."
  },
  {
      "symbol": "IMI",
      "name": "Intermolecular, Inc."
  },
  {
      "symbol": "IMKTA",
      "name": "Ingles Markets, Incorporated"
  },
  {
      "symbol": "IMMR",
      "name": "Immersion Corporation"
  },
  {
      "symbol": "IMMU",
      "name": "Immunomedics, Inc."
  },
  {
      "symbol": "IMN",
      "name": "Imation Corporation"
  },
  {
      "symbol": "IMO",
      "name": "Imperial Oil Limited"
  },
  {
      "symbol": "IMOS",
      "name": "ChipMOS TECHNOLOGIES (Bermuda) LTD."
  },
  {
      "symbol": "IMPV",
      "name": "Imperva, Inc."
  },
  {
      "symbol": "IMRS",
      "name": "Imris Inc"
  },
  {
      "symbol": "IMS",
      "name": "Invesco Value Municipal Securities"
  },
  {
      "symbol": "IMT",
      "name": "Invesco Value Municipal Trust"
  },
  {
      "symbol": "IN",
      "name": "UNOVA, Inc."
  },
  {
      "symbol": "INAP",
      "name": "Internap Network Services Corporation"
  },
  {
      "symbol": "INB",
      "name": "Cohen & Steers Global Income Builder, Inc."
  },
  {
      "symbol": "INCB",
      "name": "Indiana Community Bancorp"
  },
  {
      "symbol": "INCY",
      "name": "Incyte Corporation"
  },
  {
      "symbol": "IND",
      "name": "ING Group, N.V."
  },
  {
      "symbol": "INDB",
      "name": "Independent Bank Corp."
  },
  {
      "symbol": "INDY",
      "name": "iShares S&P India Nifty 50 Index Fund"
  },
  {
      "symbol": "INF",
      "name": "Brookfield Global Listed Infrastructure Income Fund"
  },
  {
      "symbol": "INFA",
      "name": "Informatica Corporation"
  },
  {
      "symbol": "INFI",
      "name": "Infinity Pharmaceuticals, Inc."
  },
  {
      "symbol": "INFN",
      "name": "Infinera Corporation"
  },
  {
      "symbol": "INFU",
      "name": "InfuSystems Holdings, Inc."
  },
  {
      "symbol": "INFY",
      "name": "Infosys Limited"
  },
  {
      "symbol": "ING",
      "name": "ING Group, N.V."
  },
  {
      "symbol": "ININ",
      "name": "Interactive Intelligence Group, Inc."
  },
  {
      "symbol": "INMD",
      "name": "IntegraMed America, Inc."
  },
  {
      "symbol": "INN",
      "name": "Summit Hotel Properties, Inc."
  },
  {
      "symbol": "INN^A",
      "name": "Summit Hotel Properties, Inc."
  },
  {
      "symbol": "INO",
      "name": "Inovio Pharmaceuticals, Inc."
  },
  {
      "symbol": "INOC",
      "name": "Innotrac Corporation"
  },
  {
      "symbol": "INOD",
      "name": "Innodata Isogen Inc"
  },
  {
      "symbol": "INPH",
      "name": "Interphase Corporation"
  },
  {
      "symbol": "INS",
      "name": "Intelligent Systems Corporation"
  },
  {
      "symbol": "INSM",
      "name": "Insmed, Inc."
  },
  {
      "symbol": "INSP",
      "name": "InfoSpace, Inc."
  },
  {
      "symbol": "INT",
      "name": "World Fuel Services Corporation"
  },
  {
      "symbol": "INTC",
      "name": "Intel Corporation"
  },
  {
      "symbol": "INTG",
      "name": "The Intergroup Corporation"
  },
  {
      "symbol": "INTL",
      "name": "INTL FCStone Inc."
  },
  {
      "symbol": "INTT",
      "name": "inTest Corporation"
  },
  {
      "symbol": "INTU",
      "name": "Intuit Inc."
  },
  {
      "symbol": "INTX",
      "name": "Intersections, Inc."
  },
  {
      "symbol": "INUV",
      "name": "Inuvo, Inc"
  },
  {
      "symbol": "INV",
      "name": "Innovaro Inc"
  },
  {
      "symbol": "INVE",
      "name": "Identive Group, Inc."
  },
  {
      "symbol": "INVN",
      "name": "InvenSense, Inc."
  },
  {
      "symbol": "INWK",
      "name": "InnerWorkings, Inc."
  },
  {
      "symbol": "INXN",
      "name": "InterXion Holding N.V."
  },
  {
      "symbol": "INZ",
      "name": "ING Group, N.V."
  },
  {
      "symbol": "IO",
      "name": "Ion Geophysical Corporation"
  },
  {
      "symbol": "IOC",
      "name": "InterOil Corporation"
  },
  {
      "symbol": "IOSP",
      "name": "Innospec Inc."
  },
  {
      "symbol": "IOT",
      "name": "Income Opportunity Realty Trust"
  },
  {
      "symbol": "IP",
      "name": "International Paper Company"
  },
  {
      "symbol": "IPAR",
      "name": "Inter Parfums, Inc."
  },
  {
      "symbol": "IPAS",
      "name": "iPass Inc."
  },
  {
      "symbol": "IPB",
      "name": "Merrill Lynch & Co., Inc."
  },
  {
      "symbol": "IPCC",
      "name": "Infinity Property and Casualty Corporation"
  },
  {
      "symbol": "IPCI",
      "name": "Intellipharmaceutics International Inc."
  },
  {
      "symbol": "IPCM",
      "name": "IPC The Hospitalist Company, Inc."
  },
  {
      "symbol": "IPG",
      "name": "Interpublic Group of Companies, Inc. (The)"
  },
  {
      "symbol": "IPGP",
      "name": "IPG Photonics Corporation"
  },
  {
      "symbol": "IPHI",
      "name": "Inphi Corporation"
  },
  {
      "symbol": "IPHS",
      "name": "Innophos Holdings, Inc."
  },
  {
      "symbol": "IPI",
      "name": "Intrepid Potash, Inc"
  },
  {
      "symbol": "IPL^B",
      "name": "Interstate Power and Light Company"
  },
  {
      "symbol": "IPSU",
      "name": "Imperial Sugar Company"
  },
  {
      "symbol": "IPT",
      "name": "iParty Corporation"
  },
  {
      "symbol": "IPXL",
      "name": "Impax Laboratories, Inc."
  },
  {
      "symbol": "IQC",
      "name": "Invesco California Municipal Securities"
  },
  {
      "symbol": "IQI",
      "name": "Invesco Quality Municipal Income Trust"
  },
  {
      "symbol": "IQM",
      "name": "Invesco Quality Municipal Securities"
  },
  {
      "symbol": "IQN",
      "name": "Invesco New York Quality Municipal Securities"
  },
  {
      "symbol": "IQNT",
      "name": "Neutral Tandem, Inc."
  },
  {
      "symbol": "IQT",
      "name": "Invesco Quality Municipal Investment Trust"
  },
  {
      "symbol": "IR",
      "name": "Ingersoll-Rand plc (Ireland)"
  },
  {
      "symbol": "IRBT",
      "name": "iRobot Corporation"
  },
  {
      "symbol": "IRC",
      "name": "Inland Real Estate Corporation"
  },
  {
      "symbol": "IRC^A",
      "name": "Inland Real Estate Corporation"
  },
  {
      "symbol": "IRDM",
      "name": "Iridium Communications Inc"
  },
  {
      "symbol": "IRDMU",
      "name": "Iridium Communications Inc"
  },
  {
      "symbol": "IRDMW",
      "name": "Iridium Communications Inc"
  },
  {
      "symbol": "IRDMZ",
      "name": "Iridium Communications Inc"
  },
  {
      "symbol": "IRE",
      "name": "Governor and Company of the Bank of Ireland (The)"
  },
  {
      "symbol": "IRET",
      "name": "Investors Real Estate Trust"
  },
  {
      "symbol": "IRETP",
      "name": "Investors Real Estate Trust"
  },
  {
      "symbol": "IRF",
      "name": "International Rectifier Corporation"
  },
  {
      "symbol": "IRIS",
      "name": "IRIS International, Inc."
  },
  {
      "symbol": "IRIX",
      "name": "IRIDEX Corporation"
  },
  {
      "symbol": "IRL",
      "name": "New Ireland Fund, Inc. (The)"
  },
  {
      "symbol": "IRM",
      "name": "Iron Mountain Incorporated"
  },
  {
      "symbol": "IROQ",
      "name": "IF Bancorp, Inc."
  },
  {
      "symbol": "IRR",
      "name": "ING Risk Managed Natural Resources Fund"
  },
  {
      "symbol": "IRS",
      "name": "IRSA Inversiones Y Representaciones S.A."
  },
  {
      "symbol": "IRWD",
      "name": "Ironwood Pharmaceuticals, Inc."
  },
  {
      "symbol": "ISBC",
      "name": "Investors Bancorp, Inc."
  },
  {
      "symbol": "ISCA",
      "name": "International Speedway Corporation"
  },
  {
      "symbol": "ISD",
      "name": "Prudential Short Duration High Yield Fund, Inc."
  },
  {
      "symbol": "ISF",
      "name": "ING Group, N.V."
  },
  {
      "symbol": "ISG",
      "name": "ING Group, N.V."
  },
  {
      "symbol": "ISH",
      "name": "International Shipholding Corporation"
  },
  {
      "symbol": "ISHG",
      "name": "iShares S&P/Citigroup 1-3 Year International Treasury Bond Fun"
  },
  {
      "symbol": "ISIG",
      "name": "Insignia Systems, Inc."
  },
  {
      "symbol": "ISIL",
      "name": "Intersil Corporation"
  },
  {
      "symbol": "ISIS",
      "name": "Isis Pharmaceuticals, Inc."
  },
  {
      "symbol": "ISL",
      "name": "Aberdeen Israel Fund, Inc."
  },
  {
      "symbol": "ISLE",
      "name": "Isle of Capri Casinos, Inc."
  },
  {
      "symbol": "ISM",
      "name": "SLM Corporation"
  },
  {
      "symbol": "ISNS",
      "name": "Image Sensing Systems, Inc."
  },
  {
      "symbol": "ISP",
      "name": "ING Group, N.V."
  },
  {
      "symbol": "ISR",
      "name": "IsoRay, Inc."
  },
  {
      "symbol": "ISRG",
      "name": "Intuitive Surgical, Inc."
  },
  {
      "symbol": "ISRL",
      "name": "Isramco, Inc."
  },
  {
      "symbol": "ISS",
      "name": "iSoftStone Holdings Limited"
  },
  {
      "symbol": "ISSC",
      "name": "Innovative Solutions and Support, Inc."
  },
  {
      "symbol": "ISSI",
      "name": "Integrated Silicon Solution, Inc."
  },
  {
      "symbol": "ISTA",
      "name": "ISTA Pharmaceuticals, Inc."
  },
  {
      "symbol": "IT",
      "name": "Gartner, Inc."
  },
  {
      "symbol": "ITC",
      "name": "ITC Holdings Corp."
  },
  {
      "symbol": "ITG",
      "name": "Investment Technology Group, Inc."
  },
  {
      "symbol": "ITI",
      "name": "Iteris, Inc."
  },
  {
      "symbol": "ITIC",
      "name": "Investors Title Company"
  },
  {
      "symbol": "ITMN",
      "name": "InterMune, Inc."
  },
  {
      "symbol": "ITRI",
      "name": "Itron, Inc."
  },
  {
      "symbol": "ITRN",
      "name": "Ituran Location and Control Ltd."
  },
  {
      "symbol": "ITT",
      "name": "ITT Corporation"
  },
  {
      "symbol": "ITUB",
      "name": "Itau Unibanco Banco Holding SA"
  },
  {
      "symbol": "ITW",
      "name": "Illinois Tool Works Inc."
  },
  {
      "symbol": "IVAC",
      "name": "Intevac, Inc."
  },
  {
      "symbol": "IVAN",
      "name": "Ivanhoe Energy, Inc."
  },
  {
      "symbol": "IVC",
      "name": "Invacare Corporation"
  },
  {
      "symbol": "IVD",
      "name": "IVAX Diagnostics, Inc."
  },
  {
      "symbol": "IVN",
      "name": "Ivanhoe Mines Ltd"
  },
  {
      "symbol": "IVR",
      "name": "INVESCO MORTGAGE CAPITAL INC"
  },
  {
      "symbol": "IVZ",
      "name": "Invesco Plc"
  },
  {
      "symbol": "IX",
      "name": "Orix Corp Ads"
  },
  {
      "symbol": "IXYS",
      "name": "IXYS Corporation"
  },
  {
      "symbol": "JACK",
      "name": "Jack In The Box Inc."
  },
  {
      "symbol": "JADE",
      "name": "LJ International, Inc."
  },
  {
      "symbol": "JAG",
      "name": "Jaguar Mining Inc"
  },
  {
      "symbol": "JAH",
      "name": "Jarden Corporation"
  },
  {
      "symbol": "JAKK",
      "name": "JAKKS Pacific, Inc."
  },
  {
      "symbol": "JASO",
      "name": "JA Solar Holdings, Co., Ltd."
  },
  {
      "symbol": "JAX",
      "name": "J. Alexander&#39;s Corporation"
  },
  {
      "symbol": "JAXB",
      "name": "Jacksonville Bancorp, Inc."
  },
  {
      "symbol": "JAZZ",
      "name": "Jazz Pharmaceuticals plc"
  },
  {
      "symbol": "JBHT",
      "name": "J.B. Hunt Transport Services, Inc."
  },
  {
      "symbol": "JBI",
      "name": "Lehman ABS Cp 7.857%"
  },
  {
      "symbol": "JBJ",
      "name": "Lehman ABS Corporation"
  },
  {
      "symbol": "JBK",
      "name": "Lehman ABS Corporation"
  },
  {
      "symbol": "JBL",
      "name": "Jabil Circuit, Inc."
  },
  {
      "symbol": "JBLU",
      "name": "JetBlue Airways Corporation"
  },
  {
      "symbol": "JBN",
      "name": "Select Asset Inc."
  },
  {
      "symbol": "JBO",
      "name": "Lehman ABS Corporation"
  },
  {
      "symbol": "JBR",
      "name": "Select Asset Inc."
  },
  {
      "symbol": "JBSS",
      "name": "John B. Sanfilippo & Son, Inc."
  },
  {
      "symbol": "JBT",
      "name": "John Bean Technologies Corporation"
  },
  {
      "symbol": "JCDA",
      "name": "Jacada Ltd."
  },
  {
      "symbol": "JCE",
      "name": "Nuveen Core Equity Alpha Fund"
  },
  {
      "symbol": "JCI",
      "name": "Johnson Controls, Inc."
  },
  {
      "symbol": "JCOM",
      "name": "j2 Global, Inc."
  },
  {
      "symbol": "JCP",
      "name": "J.C. Penney Company, Inc. Holding Company"
  },
  {
      "symbol": "JCS",
      "name": "Communications Systems, Inc."
  },
  {
      "symbol": "JCTCF",
      "name": "Jewett-Cameron Trading Company"
  },
  {
      "symbol": "JDAS",
      "name": "JDA Software Group, Inc."
  },
  {
      "symbol": "JDD",
      "name": "Nuveen Diversified Dividend and Income Fund"
  },
  {
      "symbol": "JDSU",
      "name": "JDS Uniphase Corporation"
  },
  {
      "symbol": "JE",
      "name": "Just Energy Group, Inc."
  },
  {
      "symbol": "JEC",
      "name": "Jacobs Engineering Group Inc."
  },
  {
      "symbol": "JEF",
      "name": "Jefferies Group, Inc."
  },
  {
      "symbol": "JEQ",
      "name": "Japan Equity Fund, Inc. (The)"
  },
  {
      "symbol": "JFBC",
      "name": "Jeffersonville Bancorp"
  },
  {
      "symbol": "JFBI",
      "name": "Jefferson Bancshares, Inc."
  },
  {
      "symbol": "JFC",
      "name": "JF China Region  Fund, Inc."
  },
  {
      "symbol": "JFP",
      "name": "Nuveen Tax-Advantaged Floating Rate Fund"
  },
  {
      "symbol": "JFR",
      "name": "Nuveen Floating Rate Income Fund"
  },
  {
      "symbol": "JGG",
      "name": "Nuveen Global Government Enhanced Income Fund"
  },
  {
      "symbol": "JGT",
      "name": "Nuveen Multi-Currency Short-Term Government Income Fund"
  },
  {
      "symbol": "JGV",
      "name": "Nuveen Global Value Opportunities Fund"
  },
  {
      "symbol": "JHI",
      "name": "John Hancock Investors Trust"
  },
  {
      "symbol": "JHP",
      "name": "Nuveen Quality Preferred Income Fund 3"
  },
  {
      "symbol": "JHS",
      "name": "John Hancock Income Securities Trust"
  },
  {
      "symbol": "JHX",
      "name": "James Hardie Industries SE"
  },
  {
      "symbol": "JIVE",
      "name": "Jive Software, Inc."
  },
  {
      "symbol": "JJSF",
      "name": "J & J Snack Foods Corp."
  },
  {
      "symbol": "JKHY",
      "name": "Jack Henry & Associates, Inc."
  },
  {
      "symbol": "JKS",
      "name": "JinkoSolar Holding Company Limited"
  },
  {
      "symbol": "JLA",
      "name": "Nuveen Equity Premium Advantage Fund"
  },
  {
      "symbol": "JLL",
      "name": "Jones Lang LaSalle Incorporated"
  },
  {
      "symbol": "JLS",
      "name": "Nuveen Mortgage Opportunity Term Fund"
  },
  {
      "symbol": "JMBA",
      "name": "Jamba, Inc."
  },
  {
      "symbol": "JMF",
      "name": "Nuveen Energy MLP Total Return Fund"
  },
  {
      "symbol": "JMP",
      "name": "JMP Group Inc"
  },
  {
      "symbol": "JMT",
      "name": "Nuven Mortgage Opportunity Term Fund 2"
  },
  {
      "symbol": "JNJ",
      "name": "Johnson & Johnson"
  },
  {
      "symbol": "JNPR",
      "name": "Juniper Networks, Inc."
  },
  {
      "symbol": "JNS",
      "name": "Janus Capital Group, Inc"
  },
  {
      "symbol": "JNY",
      "name": "Jones Group, Inc. (The)"
  },
  {
      "symbol": "JOB",
      "name": "General Employment Enterprises, Inc."
  },
  {
      "symbol": "JOBS",
      "name": "51job, Inc."
  },
  {
      "symbol": "JOE",
      "name": "St. Joe Company (The)"
  },
  {
      "symbol": "JOEZ",
      "name": "Joe&#39;s Jeans Inc."
  },
  {
      "symbol": "JOF",
      "name": "Japan Smaller Capitalization Fund Inc"
  },
  {
      "symbol": "JOSB",
      "name": "Jos. A. Bank Clothiers, Inc."
  },
  {
      "symbol": "JOUT",
      "name": "Johnson Outdoors Inc."
  },
  {
      "symbol": "JOY",
      "name": "Joy Global Inc."
  },
  {
      "symbol": "JPC",
      "name": "Nuveen Preferred Income Opportunites Fund"
  },
  {
      "symbol": "JPG",
      "name": "Nuveen Equity Premium and Growth Fund"
  },
  {
      "symbol": "JPM",
      "name": "J P Morgan Chase & Co"
  },
  {
      "symbol": "JPM/WS",
      "name": "J P Morgan Chase & Co"
  },
  {
      "symbol": "JPM^B",
      "name": "J P Morgan Chase & Co"
  },
  {
      "symbol": "JPM^C",
      "name": "J P Morgan Chase & Co"
  },
  {
      "symbol": "JPM^I",
      "name": "J P Morgan Chase & Co"
  },
  {
      "symbol": "JPM^J",
      "name": "J P Morgan Chase & Co"
  },
  {
      "symbol": "JPM^K",
      "name": "J P Morgan Chase & Co"
  },
  {
      "symbol": "JPM^O",
      "name": "J P Morgan Chase & Co"
  },
  {
      "symbol": "JPM^P",
      "name": "J P Morgan Chase & Co"
  },
  {
      "symbol": "JPM^S",
      "name": "J P Morgan Chase & Co"
  },
  {
      "symbol": "JPM^W",
      "name": "J P Morgan Chase & Co"
  },
  {
      "symbol": "JPM^X",
      "name": "J P Morgan Chase & Co"
  },
  {
      "symbol": "JPM^Y",
      "name": "J P Morgan Chase & Co"
  },
  {
      "symbol": "JPM^Z",
      "name": "J P Morgan Chase & Co"
  },
  {
      "symbol": "JPS",
      "name": "Nuveen Quality Preferred Income Fund 2"
  },
  {
      "symbol": "JPZ",
      "name": "Nuveen Equity Premium Income Fund"
  },
  {
      "symbol": "JQC",
      "name": "Nuveen Credit Strategies Income Fund"
  },
  {
      "symbol": "JRCC",
      "name": "James River Coal Company"
  },
  {
      "symbol": "JRI",
      "name": "Nuveen Real Asset Income and Growth Fund"
  },
  {
      "symbol": "JRJC",
      "name": "China Finance Online Co. Limited"
  },
  {
      "symbol": "JRN",
      "name": "Journal Communications, Inc."
  },
  {
      "symbol": "JRO",
      "name": "Nuveen Floating Rate Income Opportuntiy Fund"
  },
  {
      "symbol": "JRS",
      "name": "Nuveen Real Estate Fund"
  },
  {
      "symbol": "JSD",
      "name": "Nuveen Short Duration Credit Opportunities Fund"
  },
  {
      "symbol": "JSDA",
      "name": "Jones Soda Co."
  },
  {
      "symbol": "JSM",
      "name": "SLM Corporation"
  },
  {
      "symbol": "JSN",
      "name": "Nuveen Equity Premium Opportunity Fund"
  },
  {
      "symbol": "JST",
      "name": "Jinpan International Limited"
  },
  {
      "symbol": "JTA",
      "name": "Nuveen Tax-Advantaged Total Return Strategy Fund"
  },
  {
      "symbol": "JTD",
      "name": "Nuveen Tax-Advantaged Dividend Growth Fund"
  },
  {
      "symbol": "JTP",
      "name": "Nuveen Quality Preferred Income Fund"
  },
  {
      "symbol": "JVA",
      "name": "Coffee Holding Co., Inc."
  },
  {
      "symbol": "JW/A",
      "name": "John Wiley & Sons, Inc."
  },
  {
      "symbol": "JW/B",
      "name": "John Wiley & Sons, Inc."
  },
  {
      "symbol": "JWF",
      "name": "Wells Fargo & Company"
  },
  {
      "symbol": "JWN",
      "name": "Nordstrom, Inc."
  },
  {
      "symbol": "JXSB",
      "name": "Jacksonville Bancorp Inc."
  },
  {
      "symbol": "JZC",
      "name": "Lehman ABS Corporation"
  },
  {
      "symbol": "JZH",
      "name": "Lehman ABS Corporation"
  },
  {
      "symbol": "JZJ",
      "name": "Lehman ABS Corporation"
  },
  {
      "symbol": "JZK",
      "name": "Lehman ABS Corporation"
  },
  {
      "symbol": "JZL",
      "name": "Lehman ABS Corporation"
  },
  {
      "symbol": "JZS",
      "name": "Lehman ABS Corporation"
  },
  {
      "symbol": "JZT",
      "name": "Lehman ABS Corp"
  },
  {
      "symbol": "JZV",
      "name": "Lehman ABS Corporation"
  },
  {
      "symbol": "K",
      "name": "Kellogg Company"
  },
  {
      "symbol": "KAI",
      "name": "Kadant Inc"
  },
  {
      "symbol": "KALU",
      "name": "Kaiser Aluminum Corporation"
  },
  {
      "symbol": "KAMN",
      "name": "Kaman Corporation"
  },
  {
      "symbol": "KAR",
      "name": "KAR Auction Services, Inc"
  },
  {
      "symbol": "KB",
      "name": "KB Financial Group Inc"
  },
  {
      "symbol": "KBALB",
      "name": "Kimball International, Inc."
  },
  {
      "symbol": "KBH",
      "name": "KB Home"
  },
  {
      "symbol": "KBR",
      "name": "KBR, Inc."
  },
  {
      "symbol": "KBW",
      "name": "KBW Inc"
  },
  {
      "symbol": "KBX",
      "name": "Kimber Resources Inc"
  },
  {
      "symbol": "KCAP",
      "name": "Kohlberg Capital Corporation"
  },
  {
      "symbol": "KCC",
      "name": "Lehman ABS Corporation"
  },
  {
      "symbol": "KCG",
      "name": "Knight Capital Group, Inc."
  },
  {
      "symbol": "KCLI",
      "name": "Kansas City Life Insurance Company"
  },
  {
      "symbol": "KCP",
      "name": "Kenneth Cole Productions, Inc."
  },
  {
      "symbol": "KCW",
      "name": "Lehman ABS Corporation"
  },
  {
      "symbol": "KDN",
      "name": "Kaydon Corporation"
  },
  {
      "symbol": "KED",
      "name": "Kayne Anderson Energy Development Company"
  },
  {
      "symbol": "KEF",
      "name": "Korea Equity Fund, Inc."
  },
  {
      "symbol": "KEG",
      "name": "Key Energy Services, Inc."
  },
  {
      "symbol": "KELYA",
      "name": "Kelly Services, Inc."
  },
  {
      "symbol": "KELYB",
      "name": "Kelly Services, Inc."
  },
  {
      "symbol": "KEM",
      "name": "Kemet Corporation"
  },
  {
      "symbol": "KEP",
      "name": "Korea Electric Power Corporation"
  },
  {
      "symbol": "KEQU",
      "name": "Kewaunee Scientific Corporation"
  },
  {
      "symbol": "KERX",
      "name": "Keryx Biopharmaceuticals, Inc."
  },
  {
      "symbol": "KEX",
      "name": "Kirby Corporation"
  },
  {
      "symbol": "KEY",
      "name": "KeyCorp"
  },
  {
      "symbol": "KEY^F",
      "name": "KeyCorp"
  },
  {
      "symbol": "KEY^G",
      "name": "KeyCorp"
  },
  {
      "symbol": "KEYN",
      "name": "Keynote Systems, Inc."
  },
  {
      "symbol": "KEYW",
      "name": "The KEYW Holding Corporation"
  },
  {
      "symbol": "KF",
      "name": "Korea Fund, Inc. (The)"
  },
  {
      "symbol": "KFFB",
      "name": "Kentucky First Federal Bancorp"
  },
  {
      "symbol": "KFFG",
      "name": "Kaiser Federal Financial Group, Inc."
  },
  {
      "symbol": "KFH",
      "name": "KKR Financial Holdings LLC"
  },
  {
      "symbol": "KFI",
      "name": "KKR Financial Holdings LLC"
  },
  {
      "symbol": "KFN",
      "name": "KKR Financial Holdings LLC"
  },
  {
      "symbol": "KFRC",
      "name": "Kforce, Inc."
  },
  {
      "symbol": "KFS",
      "name": "Kingsway Financial Services, Inc."
  },
  {
      "symbol": "KFT",
      "name": "Kraft Foods Inc."
  },
  {
      "symbol": "KFY",
      "name": "Korn/Ferry International"
  },
  {
      "symbol": "KGC",
      "name": "Kinross Gold Corporation"
  },
  {
      "symbol": "KGJI",
      "name": "Kingold Jewelry Inc."
  },
  {
      "symbol": "KGN",
      "name": "Keegan Resources Inc"
  },
  {
      "symbol": "KH",
      "name": "China Kanghui Holdings"
  },
  {
      "symbol": "KHI",
      "name": "Scudder High Income Trust"
  },
  {
      "symbol": "KID",
      "name": "Kid Brands, Inc."
  },
  {
      "symbol": "KIM",
      "name": "Kimco Realty Corporation"
  },
  {
      "symbol": "KIM^F",
      "name": "Kimco Realty Corporation"
  },
  {
      "symbol": "KIM^G",
      "name": "Kimco Realty Corporation"
  },
  {
      "symbol": "KIM^H",
      "name": "Kimco Realty Corporation"
  },
  {
      "symbol": "KIM^I",
      "name": "Kimco Realty Corporation"
  },
  {
      "symbol": "KINS",
      "name": "Kingstone Companies, Inc"
  },
  {
      "symbol": "KIOR",
      "name": "KiOR, Inc."
  },
  {
      "symbol": "KIPO",
      "name": "Keating Capital, Inc."
  },
  {
      "symbol": "KIPS",
      "name": "Kips Bay Medical, Inc."
  },
  {
      "symbol": "KIRK",
      "name": "Kirkland&#39;s, Inc."
  },
  {
      "symbol": "KITD",
      "name": "KIT digital, Inc."
  },
  {
      "symbol": "KKD",
      "name": "Krispy Kreme Doughnuts, Inc."
  },
  {
      "symbol": "KKR",
      "name": "KKR & Co. L.P."
  },
  {
      "symbol": "KLAC",
      "name": "KLA-Tencor Corporation"
  },
  {
      "symbol": "KLIC",
      "name": "Kulicke and Soffa Industries, Inc."
  },
  {
      "symbol": "KMB",
      "name": "Kimberly-Clark Corporation"
  },
  {
      "symbol": "KMF",
      "name": "Kayne Anderson Midstream Energy Fund, Inc"
  },
  {
      "symbol": "KMGB",
      "name": "KMG Chemicals, Inc."
  },
  {
      "symbol": "KMI",
      "name": "Kinder Morgan, Inc."
  },
  {
      "symbol": "KMM",
      "name": "Scudder Multi-Market Income Trust"
  },
  {
      "symbol": "KMP",
      "name": "Kinder Morgan Energy Partners, L.P."
  },
  {
      "symbol": "KMPR",
      "name": "Kemper Corporation"
  },
  {
      "symbol": "KMR",
      "name": "Kinder Morgan Management, LLC"
  },
  {
      "symbol": "KMT",
      "name": "Kennametal Inc."
  },
  {
      "symbol": "KMX",
      "name": "CarMax Inc"
  },
  {
      "symbol": "KND",
      "name": "Kindred Healthcare, Inc."
  },
  {
      "symbol": "KNDI",
      "name": "Kandi Technolgies, Corp."
  },
  {
      "symbol": "KNL",
      "name": "Knoll, Inc."
  },
  {
      "symbol": "KNM",
      "name": "Konami Corporation"
  },
  {
      "symbol": "KNO",
      "name": "Lehman ABS Corporation"
  },
  {
      "symbol": "KNOL",
      "name": "Knology, Inc."
  },
  {
      "symbol": "KNR",
      "name": "Lehman ABS Corporation"
  },
  {
      "symbol": "KNSY",
      "name": "Kensey Nash Corporation"
  },
  {
      "symbol": "KNX",
      "name": "Knight Transportation, Inc."
  },
  {
      "symbol": "KNXA",
      "name": "Kenexa Corporation"
  },
  {
      "symbol": "KO",
      "name": "Coca-Cola Company (The)"
  },
  {
      "symbol": "KOF",
      "name": "Coca Cola Femsa S.A.B. de C.V."
  },
  {
      "symbol": "KOG",
      "name": "Kodiak Oil"
  },
  {
      "symbol": "KONA",
      "name": "Kona Grill, Inc."
  },
  {
      "symbol": "KONE",
      "name": "Kingtone Wirelessinfo Solution Holding Ltd"
  },
  {
      "symbol": "KONG",
      "name": "KongZhong Corporation"
  },
  {
      "symbol": "KOOL",
      "name": "THERMOGENESIS Corp."
  },
  {
      "symbol": "KOP",
      "name": "Koppers Holdings Inc."
  },
  {
      "symbol": "KOPN",
      "name": "Kopin Corporation"
  },
  {
      "symbol": "KORS",
      "name": "Michael Kors Holdings Limited"
  },
  {
      "symbol": "KOS",
      "name": "Kosmos Energy Ltd."
  },
  {
      "symbol": "KOSS",
      "name": "Koss Corporation"
  },
  {
      "symbol": "KR",
      "name": "Kroger Company (The)"
  },
  {
      "symbol": "KRA",
      "name": "Kraton Performance Polymers, Inc"
  },
  {
      "symbol": "KRB^D",
      "name": "MBNA Corporation"
  },
  {
      "symbol": "KRB^E",
      "name": "MBNA Corporation"
  },
  {
      "symbol": "KRC",
      "name": "Kilroy Realty Corporation"
  },
  {
      "symbol": "KRC^G",
      "name": "Kilroy Realty Corporation"
  },
  {
      "symbol": "KRG",
      "name": "Kite Realty Group Trust"
  },
  {
      "symbol": "KRG^A",
      "name": "Kite Realty Group Trust"
  },
  {
      "symbol": "KRJ",
      "name": "Lehman ABS Corporation"
  },
  {
      "symbol": "KRNY",
      "name": "Kearny Financial"
  },
  {
      "symbol": "KRO",
      "name": "Kronos Worldwide Inc"
  },
  {
      "symbol": "KS",
      "name": "KapStone Paper and Packaging Corporation"
  },
  {
      "symbol": "KSA",
      "name": "Lehman ABS Corporation"
  },
  {
      "symbol": "KSK",
      "name": "Lehman ABS Corporation"
  },
  {
      "symbol": "KSM",
      "name": "Scudder Strategic Municiple Income Trust"
  },
  {
      "symbol": "KSS",
      "name": "Kohl&#39;s Corporation"
  },
  {
      "symbol": "KST",
      "name": "Scudder Strategic Income Trust"
  },
  {
      "symbol": "KSU",
      "name": "Kansas City Southern"
  },
  {
      "symbol": "KSU^",
      "name": "Kansas City Southern"
  },
  {
      "symbol": "KSW",
      "name": "KSW Inc"
  },
  {
      "symbol": "KSWS",
      "name": "K-Swiss Inc."
  },
  {
      "symbol": "KT",
      "name": "Korea Telecom Corporation"
  },
  {
      "symbol": "KTCC",
      "name": "Key Tronic Corporation"
  },
  {
      "symbol": "KTEC",
      "name": "Key Technology, Inc."
  },
  {
      "symbol": "KTF",
      "name": "Scudder Municiple Income Trust"
  },
  {
      "symbol": "KTH",
      "name": "Lehman ABS Corporation"
  },
  {
      "symbol": "KTN",
      "name": "Lehman ABS Corporation"
  },
  {
      "symbol": "KTOS",
      "name": "Kratos Defense & Security Solutions, Inc."
  },
  {
      "symbol": "KTP",
      "name": "Lehman ABS Corporation"
  },
  {
      "symbol": "KUB",
      "name": "Kubota Corporation"
  },
  {
      "symbol": "KUN",
      "name": "China Shenghuo Pharmaceutical Holdings, Inc"
  },
  {
      "symbol": "KUTV",
      "name": "Ku6 Media Co., Ltd."
  },
  {
      "symbol": "KV/A",
      "name": "K-V Pharmaceutical Company"
  },
  {
      "symbol": "KV/B",
      "name": "K-V Pharmaceutical Company"
  },
  {
      "symbol": "KVHI",
      "name": "KVH Industries, Inc."
  },
  {
      "symbol": "KW",
      "name": "Kennedy-Wilson Holdings Inc."
  },
  {
      "symbol": "KWK",
      "name": "Quicksilver Resources Inc."
  },
  {
      "symbol": "KWR",
      "name": "Quaker Chemical Corporation"
  },
  {
      "symbol": "KXM",
      "name": "Kobex Minerals Inc."
  },
  {
      "symbol": "KYE",
      "name": "Kayne Anderson Energy Total Return Fund, Inc."
  },
  {
      "symbol": "KYN",
      "name": "Kayne Anderson MLP Investment Company"
  },
  {
      "symbol": "KYN^D",
      "name": "Kayne Anderson MLP Investment Company"
  },
  {
      "symbol": "KYN^E",
      "name": "Kayne Anderson MLP Investment Company"
  },
  {
      "symbol": "KYO",
      "name": "Kyocera Corporation"
  },
  {
      "symbol": "L",
      "name": "Loews Corporation"
  },
  {
      "symbol": "LABC",
      "name": "Louisiana Bancorp, Inc."
  },
  {
      "symbol": "LABL",
      "name": "Multi-Color Corporation"
  },
  {
      "symbol": "LACO",
      "name": "Lakes Entertainment, Inc."
  },
  {
      "symbol": "LAD",
      "name": "Lithia Motors, Inc."
  },
  {
      "symbol": "LAKE",
      "name": "Lakeland Industries, Inc."
  },
  {
      "symbol": "LAMR",
      "name": "Lamar Advertising Company"
  },
  {
      "symbol": "LANC",
      "name": "Lancaster Colony Corporation"
  },
  {
      "symbol": "LAQ",
      "name": "Latin America Equity Fund, Inc. (The)"
  },
  {
      "symbol": "LARK",
      "name": "Landmark Bancorp Inc."
  },
  {
      "symbol": "LAS",
      "name": "Lentuo International Inc."
  },
  {
      "symbol": "LAWS",
      "name": "Lawson Products, Inc."
  },
  {
      "symbol": "LAYN",
      "name": "Layne Christensen Company"
  },
  {
      "symbol": "LAZ",
      "name": "Lazard Ltd."
  },
  {
      "symbol": "LBAI",
      "name": "Lakeland Bancorp, Inc."
  },
  {
      "symbol": "LBF",
      "name": "Scudder Global High Income Fund, Inc."
  },
  {
      "symbol": "LBIX",
      "name": "Leading Brands Inc"
  },
  {
      "symbol": "LBTYA",
      "name": "Liberty Global, Inc."
  },
  {
      "symbol": "LBTYB",
      "name": "Liberty Global, Inc."
  },
  {
      "symbol": "LBTYK",
      "name": "Liberty Global, Inc."
  },
  {
      "symbol": "LBY",
      "name": "Libbey, Inc."
  },
  {
      "symbol": "LCAV",
      "name": "LCA-Vision Inc."
  },
  {
      "symbol": "LCC",
      "name": "US Airways Group, Inc. New"
  },
  {
      "symbol": "LCI",
      "name": "Lannett Co Inc"
  },
  {
      "symbol": "LCM",
      "name": "Advent/Claymore Enhanced Growth & Income Fund"
  },
  {
      "symbol": "LCNB",
      "name": "LCNB Corporation"
  },
  {
      "symbol": "LCRY",
      "name": "LeCroy Corporation"
  },
  {
      "symbol": "LCUT",
      "name": "Lifetime Brands, Inc."
  },
  {
      "symbol": "LDF",
      "name": "Latin American Discovery Fund, Inc. (The)"
  },
  {
      "symbol": "LDK",
      "name": "LDK Solar Co. Ltd."
  },
  {
      "symbol": "LDL",
      "name": "Lydall, Inc."
  },
  {
      "symbol": "LDR",
      "name": "Landauer, Inc."
  },
  {
      "symbol": "LEA",
      "name": "Lear Corporation"
  },
  {
      "symbol": "LEAP",
      "name": "Leap Wireless International, Inc."
  },
  {
      "symbol": "LECO",
      "name": "Lincoln Electric Holdings, Inc."
  },
  {
      "symbol": "LEDR",
      "name": "Market Leader, Inc"
  },
  {
      "symbol": "LEDS",
      "name": "SemiLEDS Corporation"
  },
  {
      "symbol": "LEE",
      "name": "Lee Enterprises, Incorporated"
  },
  {
      "symbol": "LEG",
      "name": "Leggett & Platt, Incorporated"
  },
  {
      "symbol": "LEI",
      "name": "Lucas Energy, Inc."
  },
  {
      "symbol": "LEN",
      "name": "Lennar Corporation"
  },
  {
      "symbol": "LEN/B",
      "name": "Lennar Corporation"
  },
  {
      "symbol": "LEO",
      "name": "Dreyfus Strategic Municipals, Inc."
  },
  {
      "symbol": "LF",
      "name": "Leapfrog Enterprises Inc"
  },
  {
      "symbol": "LFC",
      "name": "China Life Insurance Company Limited"
  },
  {
      "symbol": "LFL",
      "name": "Lan Chile S.A."
  },
  {
      "symbol": "LFUS",
      "name": "Littelfuse, Inc."
  },
  {
      "symbol": "LG",
      "name": "Laclede Group, Inc."
  },
  {
      "symbol": "LGCY",
      "name": "Legacy Reserves LP"
  },
  {
      "symbol": "LGF",
      "name": "Lions Gate Entertainment Corporation"
  },
  {
      "symbol": "LGI",
      "name": "Lazard Global Total Return and Income Fund"
  },
  {
      "symbol": "LGL",
      "name": "LGL Group, Inc. (The)"
  },
  {
      "symbol": "LGND",
      "name": "Ligand Pharmaceuticals Incorporated"
  },
  {
      "symbol": "LH",
      "name": "Laboratory Corporation of America Holdings"
  },
  {
      "symbol": "LHCG",
      "name": "LHC Group"
  },
  {
      "symbol": "LHO",
      "name": "LaSalle Hotel Properties"
  },
  {
      "symbol": "LHO^D/CL",
      "name": "LaSalle Hotel Properties"
  },
  {
      "symbol": "LHO^E/CL",
      "name": "LaSalle Hotel Properties"
  },
  {
      "symbol": "LHO^G",
      "name": "LaSalle Hotel Properties"
  },
  {
      "symbol": "LHO^H",
      "name": "LaSalle Hotel Properties"
  },
  {
      "symbol": "LIFE",
      "name": "Life Technologies Corporation"
  },
  {
      "symbol": "LII",
      "name": "Lennox International, Inc."
  },
  {
      "symbol": "LIME",
      "name": "Lime Energy Co."
  },
  {
      "symbol": "LINC",
      "name": "Lincoln Educational Services Corporation"
  },
  {
      "symbol": "LINE",
      "name": "Linn Energy, LLC"
  },
  {
      "symbol": "LINTA",
      "name": "Liberty Interactive Corporation"
  },
  {
      "symbol": "LINTB",
      "name": "Liberty Interactive Corporation"
  },
  {
      "symbol": "LION",
      "name": "Fidelity Southern Corporation"
  },
  {
      "symbol": "LIOX",
      "name": "Lionbridge Technologies, Inc."
  },
  {
      "symbol": "LIVE",
      "name": "LiveDeal, Inc."
  },
  {
      "symbol": "LIWA",
      "name": "Lihua International, Inc."
  },
  {
      "symbol": "LIZ",
      "name": "Liz Claiborne, Inc."
  },
  {
      "symbol": "LKFN",
      "name": "Lakeland Financial Corporation"
  },
  {
      "symbol": "LKQX",
      "name": "LKQ Corporation"
  },
  {
      "symbol": "LL",
      "name": "Lumber Liquidators Holdings, Inc"
  },
  {
      "symbol": "LLEN",
      "name": "L&L Energy, Inc."
  },
  {
      "symbol": "LLL",
      "name": "L-3 Communications Holdings, Inc."
  },
  {
      "symbol": "LLNW",
      "name": "Limelight Networks, Inc."
  },
  {
      "symbol": "LLTC",
      "name": "Linear Technology Corporation"
  },
  {
      "symbol": "LLY",
      "name": "Eli Lilly and Company"
  },
  {
      "symbol": "LM",
      "name": "Legg Mason, Inc."
  },
  {
      "symbol": "LMAT",
      "name": "LeMaitre Vascular, Inc."
  },
  {
      "symbol": "LMCA",
      "name": "Liberty Media Corporation"
  },
  {
      "symbol": "LMCB",
      "name": "Liberty Media Corporation"
  },
  {
      "symbol": "LMIA",
      "name": "LMI Aerospace, Inc."
  },
  {
      "symbol": "LMLP",
      "name": "LML Payment Systems, Inc."
  },
  {
      "symbol": "LMNR",
      "name": "Limoneira Co"
  },
  {
      "symbol": "LMNX",
      "name": "Luminex Corporation"
  },
  {
      "symbol": "LMOS",
      "name": "Lumos Networks Corp."
  },
  {
      "symbol": "LMT",
      "name": "Lockheed Martin Corporation"
  },
  {
      "symbol": "LNBB",
      "name": "LNB Bancorp, Inc."
  },
  {
      "symbol": "LNC",
      "name": "Lincoln National Corporation"
  },
  {
      "symbol": "LNC/WS",
      "name": "Lincoln National Corporation"
  },
  {
      "symbol": "LNC^",
      "name": "Lincoln National Corporation"
  },
  {
      "symbol": "LNCE",
      "name": "Snyder&#39;s-Lance, Inc."
  },
  {
      "symbol": "LNCR",
      "name": "Lincare Holdings Inc."
  },
  {
      "symbol": "LNDC",
      "name": "Landec Corporation"
  },
  {
      "symbol": "LNET",
      "name": "LodgeNet Interactive Corporation"
  },
  {
      "symbol": "LNG",
      "name": "Cheniere Energy, Inc."
  },
  {
      "symbol": "LNKD",
      "name": "LinkedIn Corporation"
  },
  {
      "symbol": "LNN",
      "name": "Lindsay Corporation"
  },
  {
      "symbol": "LNT",
      "name": "Alliant Energy Corporation"
  },
  {
      "symbol": "LO",
      "name": "Lorillard, Inc"
  },
  {
      "symbol": "LOAN",
      "name": "Manhattan Bridge Capital, Inc"
  },
  {
      "symbol": "LOCM",
      "name": "Local.com Corporation"
  },
  {
      "symbol": "LODE",
      "name": "Comstock Mining, Inc."
  },
  {
      "symbol": "LOGI",
      "name": "Logitech International S.A."
  },
  {
      "symbol": "LOGM",
      "name": "LogMein, Inc."
  },
  {
      "symbol": "LOJN",
      "name": "LoJack Corporation"
  },
  {
      "symbol": "LON",
      "name": "Loncor Resources Inc."
  },
  {
      "symbol": "LONG",
      "name": "eLong, Inc."
  },
  {
      "symbol": "LOOK",
      "name": "LookSmart, Ltd."
  },
  {
      "symbol": "LOPE",
      "name": "Grand Canyon Education, Inc."
  },
  {
      "symbol": "LOR",
      "name": "Lazard World Dividend & Income Fund, Inc."
  },
  {
      "symbol": "LORL",
      "name": "Loral Space and Communications, Inc."
  },
  {
      "symbol": "LOV",
      "name": "Spark Networks, Inc."
  },
  {
      "symbol": "LOW",
      "name": "Lowe&#39;s Companies, Inc."
  },
  {
      "symbol": "LPH",
      "name": "Longwei Petroleum Investment Holding Limited"
  },
  {
      "symbol": "LPHI",
      "name": "Life Partners Holdings Inc"
  },
  {
      "symbol": "LPI",
      "name": "Laredo Petroleum Holdings, Inc."
  },
  {
      "symbol": "LPL",
      "name": "LG Display Co., Limited American Depositary Shares"
  },
  {
      "symbol": "LPLA",
      "name": "LPL Investment Holdings Inc."
  },
  {
      "symbol": "LPNT",
      "name": "LifePoint Hospitals, Inc."
  },
  {
      "symbol": "LPR",
      "name": "Lone Pine Resources Inc."
  },
  {
      "symbol": "LPS",
      "name": "Lender Processing Services, Inc"
  },
  {
      "symbol": "LPSB",
      "name": "LaPorte Bancorp, Inc."
  },
  {
      "symbol": "LPSN",
      "name": "LivePerson, Inc."
  },
  {
      "symbol": "LPTH",
      "name": "LightPath Technologies, Inc."
  },
  {
      "symbol": "LPX",
      "name": "Louisiana-Pacific Corporation"
  },
  {
      "symbol": "LQDT",
      "name": "Liquidity Services, Inc."
  },
  {
      "symbol": "LRAD",
      "name": "LRAD Corporation"
  },
  {
      "symbol": "LRCX",
      "name": "Lam Research Corporation"
  },
  {
      "symbol": "LRE",
      "name": "LRR Energy, L.P."
  },
  {
      "symbol": "LRN",
      "name": "K12 Inc"
  },
  {
      "symbol": "LRY",
      "name": "Liberty Property Trust"
  },
  {
      "symbol": "LSBI",
      "name": "LSB Financial Corp."
  },
  {
      "symbol": "LSBK",
      "name": "Lake Shore Bancorp, Inc."
  },
  {
      "symbol": "LSCC",
      "name": "Lattice Semiconductor Corporation"
  },
  {
      "symbol": "LSE",
      "name": "Caplease Funding Inc"
  },
  {
      "symbol": "LSE^A",
      "name": "Caplease Funding Inc"
  },
  {
      "symbol": "LSE^B",
      "name": "Caplease Funding Inc"
  },
  {
      "symbol": "LSG",
      "name": "Lake Shore Gold Corp"
  },
  {
      "symbol": "LSI",
      "name": "LSI Logic Corporation"
  },
  {
      "symbol": "LSTR",
      "name": "Landstar System, Inc."
  },
  {
      "symbol": "LTBR",
      "name": "Lightbridge Corporation"
  },
  {
      "symbol": "LTC",
      "name": "LTC Properties, Inc."
  },
  {
      "symbol": "LTD",
      "name": "Limited Brands, Inc."
  },
  {
      "symbol": "LTM",
      "name": "Life Time Fitness"
  },
  {
      "symbol": "LTON",
      "name": "Linktone Ltd."
  },
  {
      "symbol": "LTRE",
      "name": "Learning Tree International, Inc."
  },
  {
      "symbol": "LTRX",
      "name": "Lantronix, Inc."
  },
  {
      "symbol": "LTS",
      "name": "Ladenburg Thalmann Financial Services Inc"
  },
  {
      "symbol": "LTXC",
      "name": "LTX-Credence Corporation"
  },
  {
      "symbol": "LUB",
      "name": "Luby&#39;s, Inc."
  },
  {
      "symbol": "LUCA",
      "name": "Luca Technologies Inc."
  },
  {
      "symbol": "LUFK",
      "name": "Lufkin Industries, Inc."
  },
  {
      "symbol": "LUK",
      "name": "Leucadia National Corporation"
  },
  {
      "symbol": "LULU",
      "name": "lululemon athletica inc."
  },
  {
      "symbol": "LUNA",
      "name": "Luna Innovations Incorporated"
  },
  {
      "symbol": "LUV",
      "name": "Southwest Airlines Company"
  },
  {
      "symbol": "LUX",
      "name": "Luxottica Group, S.p.A."
  },
  {
      "symbol": "LVB",
      "name": "Steinway Musical Instruments, Inc."
  },
  {
      "symbol": "LVLT",
      "name": "Level 3 Communications, Inc."
  },
  {
      "symbol": "LVS",
      "name": "Las Vegas Sands Corp."
  },
  {
      "symbol": "LWAY",
      "name": "Lifeway Foods, Inc."
  },
  {
      "symbol": "LXK",
      "name": "Lexmark International, Inc."
  },
  {
      "symbol": "LXP",
      "name": "Lexington Realty Trust"
  },
  {
      "symbol": "LXP^B/CL",
      "name": "Lexington Realty Trust"
  },
  {
      "symbol": "LXP^C",
      "name": "Lexington Realty Trust"
  },
  {
      "symbol": "LXP^D",
      "name": "Lexington Realty Trust"
  },
  {
      "symbol": "LXRX",
      "name": "Lexicon Pharmaceuticals, Inc."
  },
  {
      "symbol": "LXU",
      "name": "Lsb Industries Inc."
  },
  {
      "symbol": "LYB",
      "name": "LyondellBasell Industries NV"
  },
  {
      "symbol": "LYG",
      "name": "Lloyds Banking Group Plc"
  },
  {
      "symbol": "LYG^A",
      "name": "Lloyds Banking Group Plc"
  },
  {
      "symbol": "LYTS",
      "name": "LSI Industries Inc."
  },
  {
      "symbol": "LYV",
      "name": "Live Nation Entertainment, Inc."
  },
  {
      "symbol": "LZB",
      "name": "La-Z-Boy Incorporated"
  },
  {
      "symbol": "LZEN",
      "name": "Lizhan Environmental Corporation"
  },
  {
      "symbol": "M",
      "name": "Macy&#39;s Inc"
  },
  {
      "symbol": "MA",
      "name": "Mastercard Incorporated"
  },
  {
      "symbol": "MAA",
      "name": "Mid-America Apartment Communities, Inc."
  },
  {
      "symbol": "MAB",
      "name": "Eaton Vance Massachusetts Municipal Bond Fund"
  },
  {
      "symbol": "MAC",
      "name": "Macerich Company (The)"
  },
  {
      "symbol": "MACK",
      "name": "Merrimack Pharmaceuticals, Inc."
  },
  {
      "symbol": "MAG",
      "name": "Magnetek, Inc."
  },
  {
      "symbol": "MAGS",
      "name": "Magal Security Systems Ltd."
  },
  {
      "symbol": "MAIN",
      "name": "Main Street Capital Corporation"
  },
  {
      "symbol": "MAKO",
      "name": "MAKO Surgical Corp."
  },
  {
      "symbol": "MALL",
      "name": "PC Mall, Inc."
  },
  {
      "symbol": "MAN",
      "name": "ManpowerGroup"
  },
  {
      "symbol": "MANH",
      "name": "Manhattan Associates, Inc."
  },
  {
      "symbol": "MANT",
      "name": "ManTech International Corporation"
  },
  {
      "symbol": "MAPP",
      "name": "MAP Pharmaceuticals, Inc."
  },
  {
      "symbol": "MAR",
      "name": "Marriot International"
  },
  {
      "symbol": "MARK",
      "name": "Remark Media, Inc."
  },
  {
      "symbol": "MARPS",
      "name": "Marine Petroleum Trust"
  },
  {
      "symbol": "MAS",
      "name": "Masco Corporation"
  },
  {
      "symbol": "MASC",
      "name": "Material Sciences Corporation"
  },
  {
      "symbol": "MASI",
      "name": "Masimo Corporation"
  },
  {
      "symbol": "MAT",
      "name": "Mattel, Inc."
  },
  {
      "symbol": "MATR",
      "name": "Mattersight Corporation"
  },
  {
      "symbol": "MATW",
      "name": "Matthews International Corporation"
  },
  {
      "symbol": "MAV",
      "name": "Pioneer Municipal High Income Advantage Trust"
  },
  {
      "symbol": "MAXY",
      "name": "Maxygen, Inc."
  },
  {
      "symbol": "MAY",
      "name": "Malaysia Fund, Inc (The)"
  },
  {
      "symbol": "MAYS",
      "name": "J. W. Mays, Inc."
  },
  {
      "symbol": "MBA",
      "name": "CIBT Education Group Inc."
  },
  {
      "symbol": "MBFI",
      "name": "MB Financial Inc."
  },
  {
      "symbol": "MBI",
      "name": "MBIA, Inc."
  },
  {
      "symbol": "MBLX",
      "name": "Metabolix, Inc."
  },
  {
      "symbol": "MBND",
      "name": "Multiband Corporation"
  },
  {
      "symbol": "MBRG",
      "name": "Middleburg Financial Corporation"
  },
  {
      "symbol": "MBT",
      "name": "Mobile TeleSystems"
  },
  {
      "symbol": "MBTF",
      "name": "M B T Financial Corp"
  },
  {
      "symbol": "MBVT",
      "name": "Merchants Bancshares, Inc."
  },
  {
      "symbol": "MBWM",
      "name": "Mercantile Bank Corporation"
  },
  {
      "symbol": "MCA",
      "name": "Blackrock MuniYield California Insured Fund, Inc."
  },
  {
      "symbol": "MCBC",
      "name": "Macatawa Bank Corporation"
  },
  {
      "symbol": "MCBF",
      "name": "Monarch Community Bancorp, Inc."
  },
  {
      "symbol": "MCBI",
      "name": "MetroCorp Bancshares, Inc."
  },
  {
      "symbol": "MCC",
      "name": "Medley Capital Corporation"
  },
  {
      "symbol": "MCD",
      "name": "McDonald&#39;s Corporation"
  },
  {
      "symbol": "MCEP",
      "name": "Mid-Con Energy Partners, LP"
  },
  {
      "symbol": "MCF",
      "name": "Contango Oil & Gas Company"
  },
  {
      "symbol": "MCGC",
      "name": "MCG Capital Corporation"
  },
  {
      "symbol": "MCHP",
      "name": "Microchip Technology Incorporated"
  },
  {
      "symbol": "MCHX",
      "name": "Marchex, Inc."
  },
  {
      "symbol": "MCI",
      "name": "Babson Capital Corporate Investors"
  },
  {
      "symbol": "MCK",
      "name": "McKesson Corporation"
  },
  {
      "symbol": "MCN",
      "name": "Madison/Claymore Covered Call & Equity Strategy Fund"
  },
  {
      "symbol": "MCO",
      "name": "Moody&#39;s Corporation"
  },
  {
      "symbol": "MCOX",
      "name": "Mecox Lane Limited"
  },
  {
      "symbol": "MCP",
      "name": "Molycorp, Inc"
  },
  {
      "symbol": "MCP^A",
      "name": "Molycorp, Inc"
  },
  {
      "symbol": "MCQ",
      "name": "Medley Capital Corporation"
  },
  {
      "symbol": "MCR",
      "name": "MFS Charter Income Trust"
  },
  {
      "symbol": "MCRI",
      "name": "Monarch Casino & Resort, Inc."
  },
  {
      "symbol": "MCRL",
      "name": "Micrel, Incorporated"
  },
  {
      "symbol": "MCRS",
      "name": "MICROS Systems, Inc."
  },
  {
      "symbol": "MCS",
      "name": "Marcus Corporation (The)"
  },
  {
      "symbol": "MCY",
      "name": "Mercury General Corporation"
  },
  {
      "symbol": "MCZ",
      "name": "Mad Catz Interactive Inc"
  },
  {
      "symbol": "MD",
      "name": "Mednax, Inc"
  },
  {
      "symbol": "MDAS",
      "name": "MedAssets, Inc."
  },
  {
      "symbol": "MDC",
      "name": "M.D.C. Holdings, Inc."
  },
  {
      "symbol": "MDCA",
      "name": "MDC Partners Inc."
  },
  {
      "symbol": "MDCI",
      "name": "Medical Action Industries Inc."
  },
  {
      "symbol": "MDCO",
      "name": "The Medicines Company"
  },
  {
      "symbol": "MDF",
      "name": "Metropolitan Health Networks, Inc."
  },
  {
      "symbol": "MDGN",
      "name": "Medgenics, Inc."
  },
  {
      "symbol": "MDGN/WS",
      "name": "Medgenics, Inc."
  },
  {
      "symbol": "MDH",
      "name": "MHI Hospitality Corporation"
  },
  {
      "symbol": "MDM",
      "name": "Mountain Province Diamonds Inc."
  },
  {
      "symbol": "MDP",
      "name": "Meredith Corporation"
  },
  {
      "symbol": "MDR",
      "name": "McDermott International, Inc."
  },
  {
      "symbol": "MDRX",
      "name": "Allscripts Healthcare Solutions, Inc."
  },
  {
      "symbol": "MDSO",
      "name": "Medidata Solutions, Inc."
  },
  {
      "symbol": "MDT",
      "name": "Medtronic, Inc."
  },
  {
      "symbol": "MDTH",
      "name": "MedCath Corporation"
  },
  {
      "symbol": "MDU",
      "name": "Mdu Res Group Inc"
  },
  {
      "symbol": "MDVN",
      "name": "Medivation, Inc."
  },
  {
      "symbol": "MDW",
      "name": "Midway Gold Corporation"
  },
  {
      "symbol": "MEA",
      "name": "Metalico Inc"
  },
  {
      "symbol": "MEAD",
      "name": "Meade Instruments Corp."
  },
  {
      "symbol": "MEAS",
      "name": "Measurement Specialties, Inc."
  },
  {
      "symbol": "MED",
      "name": "MEDIFAST INC"
  },
  {
      "symbol": "MEDW",
      "name": "MEDIWARE Information Systems, Inc."
  },
  {
      "symbol": "MEG",
      "name": "Media General, Inc."
  },
  {
      "symbol": "MEI",
      "name": "Methode Electronics, Inc."
  },
  {
      "symbol": "MELA",
      "name": "MELA Sciences, Inc"
  },
  {
      "symbol": "MELI",
      "name": "MercadoLibre, Inc."
  },
  {
      "symbol": "MEMP",
      "name": "Memorial Production Partners LP"
  },
  {
      "symbol": "MEMS",
      "name": "MEMSIC, Inc."
  },
  {
      "symbol": "MEN",
      "name": "Blackrock MuniEnhanced Fund, Inc."
  },
  {
      "symbol": "MENT",
      "name": "Mentor Graphics Corporation"
  },
  {
      "symbol": "MEOH",
      "name": "Methanex Corporation"
  },
  {
      "symbol": "MER^D",
      "name": "Merrill Lynch & Co., Inc."
  },
  {
      "symbol": "MER^E",
      "name": "Merrill Lynch & Co., Inc."
  },
  {
      "symbol": "MER^F",
      "name": "Merrill Lynch & Co., Inc."
  },
  {
      "symbol": "MER^K",
      "name": "Merrill Lynch & Co., Inc."
  },
  {
      "symbol": "MER^M",
      "name": "Merrill Lynch & Co., Inc."
  },
  {
      "symbol": "MER^P",
      "name": "Merrill Lynch & Co., Inc."
  },
  {
      "symbol": "MERC",
      "name": "Mercer International Inc."
  },
  {
      "symbol": "MERU",
      "name": "Meru Networks, Inc."
  },
  {
      "symbol": "MET",
      "name": "MetLife, Inc."
  },
  {
      "symbol": "MET^A",
      "name": "MetLife, Inc."
  },
  {
      "symbol": "MET^B",
      "name": "MetLife, Inc."
  },
  {
      "symbol": "METR",
      "name": "Metro Bancorp, Inc"
  },
  {
      "symbol": "MFA",
      "name": "America First Mortgage Investments, Inc."
  },
  {
      "symbol": "MFA^A",
      "name": "America First Mortgage Investments, Inc."
  },
  {
      "symbol": "MFB",
      "name": "Maidenform Brands, Inc."
  },
  {
      "symbol": "MFC",
      "name": "Manulife Financial Corp"
  },
  {
      "symbol": "MFD",
      "name": "Macquarie/First Trust Global"
  },
  {
      "symbol": "MFG",
      "name": "Mizuho Financial Group, Inc."
  },
  {
      "symbol": "MFI",
      "name": "MicroFinancial Incorporated"
  },
  {
      "symbol": "MFL",
      "name": "Blackrock MuniHoldings Investment Quality Fund"
  },
  {
      "symbol": "MFLR",
      "name": "Mayflower Bancorp, Inc."
  },
  {
      "symbol": "MFLX",
      "name": "Multi-Fineline Electronix, Inc."
  },
  {
      "symbol": "MFM",
      "name": "MFS Municipal Income Trust"
  },
  {
      "symbol": "MFNC",
      "name": "Mackinac Financial Corporation"
  },
  {
      "symbol": "MFO",
      "name": "America First Mortgage Investments, Inc."
  },
  {
      "symbol": "MFRI",
      "name": "MFRI, Inc."
  },
  {
      "symbol": "MFRM",
      "name": "Mattress Firm Holding Corp."
  },
  {
      "symbol": "MFSF",
      "name": "MutualFirst Financial Inc."
  },
  {
      "symbol": "MFT",
      "name": "Blackrock MuniYield Investment QualityFund"
  },
  {
      "symbol": "MFV",
      "name": "MFS Special Value Trust"
  },
  {
      "symbol": "MG",
      "name": "Mistras Group Inc"
  },
  {
      "symbol": "MGA",
      "name": "Magna International, Inc."
  },
  {
      "symbol": "MGAM",
      "name": "Multimedia Games Holding Company, Inc."
  },
  {
      "symbol": "MGEE",
      "name": "MGE Energy Inc."
  },
  {
      "symbol": "MGF",
      "name": "MFS Government Markets Income Trust"
  },
  {
      "symbol": "MGH",
      "name": "Minco Gold Corporation"
  },
  {
      "symbol": "MGI",
      "name": "Moneygram International, Inc."
  },
  {
      "symbol": "MGIC",
      "name": "Magic Software Enterprises Ltd."
  },
  {
      "symbol": "MGLN",
      "name": "Magellan Health Services, Inc."
  },
  {
      "symbol": "MGM",
      "name": "MGM Resorts International"
  },
  {
      "symbol": "MGN",
      "name": "Mines Management, Inc."
  },
  {
      "symbol": "MGPI",
      "name": "MGP Ingredients, Inc."
  },
  {
      "symbol": "MGRC",
      "name": "McGrath RentCorp"
  },
  {
      "symbol": "MGT",
      "name": "MGT Capital Investments Inc"
  },
  {
      "symbol": "MGU",
      "name": "Macquarie Global Infrastructure Total Return Fund Inc."
  },
  {
      "symbol": "MGYR",
      "name": "Magyar Bancorp, Inc."
  },
  {
      "symbol": "MHD",
      "name": "Blackrock MuniHoldings Fund, Inc."
  },
  {
      "symbol": "MHE",
      "name": "Massachusetts Health and Education Tax-Exempt Trust"
  },
  {
      "symbol": "MHF",
      "name": "Western Asset Municipal High Income Fund, Inc."
  },
  {
      "symbol": "MHGC",
      "name": "Morgans Hotel Group Co."
  },
  {
      "symbol": "MHH",
      "name": "Mastech Holdings, Inc"
  },
  {
      "symbol": "MHI",
      "name": "Pioneer Municipal High Income Trust"
  },
  {
      "symbol": "MHK",
      "name": "Mohawk Industries, Inc."
  },
  {
      "symbol": "MHLD",
      "name": "Maiden Holdings, Ltd."
  },
  {
      "symbol": "MHN",
      "name": "Blackrock MuniHoldings New York Quality Fund, Inc."
  },
  {
      "symbol": "MHNA",
      "name": "Maiden Holdings, Ltd."
  },
  {
      "symbol": "MHNB",
      "name": "Maiden Holdings, Ltd."
  },
  {
      "symbol": "MHO",
      "name": "M/I Homes, Inc."
  },
  {
      "symbol": "MHO^A",
      "name": "M/I Homes, Inc."
  },
  {
      "symbol": "MHP",
      "name": "McGraw-Hill Companies, Inc. (The)"
  },
  {
      "symbol": "MHR",
      "name": "Magnum Hunter Resources Corporation"
  },
  {
      "symbol": "MHR^C",
      "name": "Magnum Hunter Resources Corporation"
  },
  {
      "symbol": "MHR^D",
      "name": "Magnum Hunter Resources Corporation"
  },
  {
      "symbol": "MHY",
      "name": "Western Asset Managed High Income Fund, Inc."
  },
  {
      "symbol": "MIC",
      "name": "Macquarie Infrastructure Company LLC"
  },
  {
      "symbol": "MIDD",
      "name": "The Middleby Corporation"
  },
  {
      "symbol": "MIG",
      "name": "Meadowbrook Insurance Group, Inc."
  },
  {
      "symbol": "MIL",
      "name": "MFC Industrial Ltd."
  },
  {
      "symbol": "MILL",
      "name": "Miller Energy Resources, Inc."
  },
  {
      "symbol": "MIM",
      "name": "MI Developments Inc"
  },
  {
      "symbol": "MIN",
      "name": "MFS Intermediate Income Trust"
  },
  {
      "symbol": "MIND",
      "name": "Mitcham Industries, Inc."
  },
  {
      "symbol": "MINI",
      "name": "Mobile Mini, Inc."
  },
  {
      "symbol": "MIPS",
      "name": "MIPS Technologies, Inc."
  },
  {
      "symbol": "MITK",
      "name": "Mitek Systems, Inc."
  },
  {
      "symbol": "MITL",
      "name": "Mitel Networks Corporation"
  },
  {
      "symbol": "MITT",
      "name": "AG Mortgage Investment Trust, Inc."
  },
  {
      "symbol": "MIW",
      "name": "Eaton Vance Michigan Municipal Bond Fund"
  },
  {
      "symbol": "MIY",
      "name": "Blackrock MuniYield Michigan Quality Fund, Inc."
  },
  {
      "symbol": "MJH",
      "name": "MS Structured Asset Corp Saturns GE Cap Corp Series 2002-14"
  },
  {
      "symbol": "MJI",
      "name": "Blackrock MuniYield New Jersey Quality Fund, Inc."
  },
  {
      "symbol": "MJN",
      "name": "Mead Johnson Nutrition Company"
  },
  {
      "symbol": "MKC",
      "name": "McCormick & Company, Incorporated"
  },
  {
      "symbol": "MKC/V",
      "name": "McCormick & Company, Incorporated"
  },
  {
      "symbol": "MKL",
      "name": "Markel Corporation"
  },
  {
      "symbol": "MKS",
      "name": "MS Structured Asset Corp Saturns GE Cap Corp Series 2002-14"
  },
  {
      "symbol": "MKSI",
      "name": "MKS Instruments, Inc."
  },
  {
      "symbol": "MKTAY",
      "name": "Makita Corp."
  },
  {
      "symbol": "MKTG",
      "name": "Responsys, Inc."
  },
  {
      "symbol": "MKTX",
      "name": "MarketAxess Holdings, Inc."
  },
  {
      "symbol": "MKV",
      "name": "Markel Corporation"
  },
  {
      "symbol": "MLAB",
      "name": "Mesa Laboratories, Inc."
  },
  {
      "symbol": "MLG",
      "name": "MetLife, Inc."
  },
  {
      "symbol": "MLHR",
      "name": "Herman Miller, Inc."
  },
  {
      "symbol": "MLI",
      "name": "Mueller Industries, Inc."
  },
  {
      "symbol": "MLM",
      "name": "Martin Marietta Materials, Inc."
  },
  {
      "symbol": "MLNK",
      "name": "ModusLink Global Solutions, Inc"
  },
  {
      "symbol": "MLNX",
      "name": "Mellanox Technologies, Ltd."
  },
  {
      "symbol": "MLP",
      "name": "Maui Land & Pineapple Company, Inc."
  },
  {
      "symbol": "MLR",
      "name": "Miller Industries, Inc."
  },
  {
      "symbol": "MLU",
      "name": "MetLife, Inc."
  },
  {
      "symbol": "MLVF",
      "name": "Malvern Federal Bancorp, Inc."
  },
  {
      "symbol": "MM",
      "name": "Millennial Media, Inc."
  },
  {
      "symbol": "MMC",
      "name": "Marsh & McLennan Companies, Inc."
  },
  {
      "symbol": "MMI",
      "name": "Motorola, Inc."
  },
  {
      "symbol": "MMLP",
      "name": "Martin Midstream Partners L.P."
  },
  {
      "symbol": "MMM",
      "name": "3M Company"
  },
  {
      "symbol": "MMP",
      "name": "Magellan Midstream Partners L.P."
  },
  {
      "symbol": "MMR",
      "name": "McMoRan Exploration Company"
  },
  {
      "symbol": "MMS",
      "name": "Maximus, Inc."
  },
  {
      "symbol": "MMSI",
      "name": "Merit Medical Systems, Inc."
  },
  {
      "symbol": "MMT",
      "name": "MFS Multimarket Income Trust"
  },
  {
      "symbol": "MMU",
      "name": "Western Asset Managed Municipals Fund, Inc."
  },
  {
      "symbol": "MMUS",
      "name": "MakeMusic, Inc."
  },
  {
      "symbol": "MMV",
      "name": "Eaton Vance Massachusetts Municipal Income Trust"
  },
  {
      "symbol": "MMYT",
      "name": "MakeMyTrip Limited"
  },
  {
      "symbol": "MMZ^K",
      "name": "SiM Internal Test 6"
  },
  {
      "symbol": "MN",
      "name": "Manning & Napier, Inc."
  },
  {
      "symbol": "MNDO",
      "name": "MIND C.T.I. Ltd."
  },
  {
      "symbol": "MNE",
      "name": "Blackrock Muni New York Intermediate Duration Fund Inc"
  },
  {
      "symbol": "MNGL",
      "name": "Blue Wolf Mongolia Holdings Corp."
  },
  {
      "symbol": "MNGLU",
      "name": "Blue Wolf Mongolia Holdings Corp."
  },
  {
      "symbol": "MNGLW",
      "name": "Blue Wolf Mongolia Holdings Corp."
  },
  {
      "symbol": "MNI",
      "name": "McClatchy Company (The)"
  },
  {
      "symbol": "MNKD",
      "name": "MannKind Corporation"
  },
  {
      "symbol": "MNOV",
      "name": "MediciNova, Inc."
  },
  {
      "symbol": "MNP",
      "name": "Western Asset Municipal Partners Fund, Inc."
  },
  {
      "symbol": "MNR",
      "name": "Monmouth Real Estate Investment Corporation"
  },
  {
      "symbol": "MNR^A",
      "name": "Monmouth Real Estate Investment Corporation"
  },
  {
      "symbol": "MNRK",
      "name": "Monarch Financial Holdings, Inc."
  },
  {
      "symbol": "MNRKP",
      "name": "Monarch Financial Holdings, Inc."
  },
  {
      "symbol": "MNRO",
      "name": "Monro Muffler Brake, Inc."
  },
  {
      "symbol": "MNST",
      "name": "Monster Beverage Corporation"
  },
  {
      "symbol": "MNTA",
      "name": "Momenta Pharmaceuticals, Inc."
  },
  {
      "symbol": "MNTG",
      "name": "MTR Gaming Group, Inc."
  },
  {
      "symbol": "MNTX",
      "name": "Manitex International, Inc."
  },
  {
      "symbol": "MO",
      "name": "Altria Group"
  },
  {
      "symbol": "MOBI",
      "name": "Sky-mobi Limited"
  },
  {
      "symbol": "MOC",
      "name": "Command Security Corporation"
  },
  {
      "symbol": "MOCO",
      "name": "MOCON, Inc."
  },
  {
      "symbol": "MOD",
      "name": "Modine Manufacturing Company"
  },
  {
      "symbol": "MODL",
      "name": "MModal Inc."
  },
  {
      "symbol": "MOFG",
      "name": "MidWestOne Financial Group, Inc."
  },
  {
      "symbol": "MOG/A",
      "name": "Moog Inc."
  },
  {
      "symbol": "MOG/B",
      "name": "Moog Inc."
  },
  {
      "symbol": "MOH",
      "name": "Molina Healthcare Inc"
  },
  {
      "symbol": "MOLX",
      "name": "Molex Incorporated"
  },
  {
      "symbol": "MOLXA",
      "name": "Molex Incorporated"
  },
  {
      "symbol": "MON",
      "name": "Monsanto Company"
  },
  {
      "symbol": "MORN",
      "name": "Morningstar, Inc."
  },
  {
      "symbol": "MOS",
      "name": "Mosaic Company (The)"
  },
  {
      "symbol": "MOSY",
      "name": "MoSys, Inc."
  },
  {
      "symbol": "MOTR",
      "name": "Motricity, Inc."
  },
  {
      "symbol": "MOV",
      "name": "Movado Group Inc."
  },
  {
      "symbol": "MOVE",
      "name": "Move, Inc."
  },
  {
      "symbol": "MP^D",
      "name": "Mississippi Power Company"
  },
  {
      "symbol": "MPA",
      "name": "Blackrock MuniYield Pennsylvania Quality Fund"
  },
  {
      "symbol": "MPAA",
      "name": "Motorcar Parts of America, Inc."
  },
  {
      "symbol": "MPAC",
      "name": "MOD-PAC CORP."
  },
  {
      "symbol": "MPB",
      "name": "Mid Penn Bancorp"
  },
  {
      "symbol": "MPC",
      "name": "Marathon Petroleum Corporation"
  },
  {
      "symbol": "MPEL",
      "name": "Melco Crown Entertainment Limited"
  },
  {
      "symbol": "MPET",
      "name": "Magellan Petroleum Corporation"
  },
  {
      "symbol": "MPG",
      "name": "MPG Office Trust, Inc."
  },
  {
      "symbol": "MPG^A",
      "name": "MPG Office Trust, Inc."
  },
  {
      "symbol": "MPJ",
      "name": "Mississippi Power Company"
  },
  {
      "symbol": "MPO",
      "name": "Midstates Petroleum Company, Inc."
  },
  {
      "symbol": "MPR",
      "name": "Met-Pro Corporation"
  },
  {
      "symbol": "MPV",
      "name": "Babson Capital Participation Investors"
  },
  {
      "symbol": "MPW",
      "name": "Medical Properties Trust, Inc."
  },
  {
      "symbol": "MPWR",
      "name": "Monolithic Power Systems, Inc."
  },
  {
      "symbol": "MPX",
      "name": "Marine Products Corporation"
  },
  {
      "symbol": "MQT",
      "name": "Blackrock MuniYield Quality Fund II, Inc."
  },
  {
      "symbol": "MQY",
      "name": "Blackrock MuniYield Quality Fund, Inc."
  },
  {
      "symbol": "MR",
      "name": "Mindray Medical International Limited"
  },
  {
      "symbol": "MRC",
      "name": "MRC Global Inc."
  },
  {
      "symbol": "MRCY",
      "name": "Mercury Computer Systems"
  },
  {
      "symbol": "MRF",
      "name": "American Income Fund, Inc."
  },
  {
      "symbol": "MRGE",
      "name": "Merge Healthcare Incorporated."
  },
  {
      "symbol": "MRH",
      "name": "Montpelier Re Holdings Ltd."
  },
  {
      "symbol": "MRH^A",
      "name": "Montpelier Re Holdings Ltd."
  },
  {
      "symbol": "MRK",
      "name": "Merck & Company, Inc."
  },
  {
      "symbol": "MRLN",
      "name": "Marlin Business Services Corp."
  },
  {
      "symbol": "MRO",
      "name": "Marathon Oil Corporation"
  },
  {
      "symbol": "MRTN",
      "name": "Marten Transport, Ltd."
  },
  {
      "symbol": "MRVL",
      "name": "Marvell Technology Group Ltd."
  },
  {
      "symbol": "MRX",
      "name": "Medicis Pharmaceutical Corporation"
  },
  {
      "symbol": "MS",
      "name": "Morgan Stanley"
  },
  {
      "symbol": "MS^A",
      "name": "Morgan Stanley"
  },
  {
      "symbol": "MSA",
      "name": "Mine Safety Appliances Company"
  },
  {
      "symbol": "MSB",
      "name": "Mesabi Trust"
  },
  {
      "symbol": "MSBF",
      "name": "MSB Financial Corp."
  },
  {
      "symbol": "MSCC",
      "name": "Microsemi Corporation"
  },
  {
      "symbol": "MSCI",
      "name": "MSCI Inc"
  },
  {
      "symbol": "MSD",
      "name": "Morgan Stanley Emerging Markets Debt Fund, Inc."
  },
  {
      "symbol": "MSEX",
      "name": "Middlesex Water Company"
  },
  {
      "symbol": "MSF",
      "name": "Morgan Stanley Emerging Markets Fund, Inc."
  },
  {
      "symbol": "MSFG",
      "name": "MainSource Financial Group, Inc."
  },
  {
      "symbol": "MSFT",
      "name": "Microsoft Corporation"
  },
  {
      "symbol": "MSG",
      "name": "The Madison Square Garden Company"
  },
  {
      "symbol": "MSHL",
      "name": "Marshall Edwards, Inc."
  },
  {
      "symbol": "MSI",
      "name": "Motorola, Inc."
  },
  {
      "symbol": "MSJ",
      "name": "Morgan Stanley"
  },
  {
      "symbol": "MSK",
      "name": "Morgan Stanley"
  },
  {
      "symbol": "MSL",
      "name": "MidSouth Bancorp"
  },
  {
      "symbol": "MSLI",
      "name": "Merus Labs International Inc."
  },
  {
      "symbol": "MSM",
      "name": "MSC Industrial Direct Company, Inc."
  },
  {
      "symbol": "MSN",
      "name": "Emerson Radio Corporation"
  },
  {
      "symbol": "MSO",
      "name": "Martha Stewart Living Omnimedia, Inc."
  },
  {
      "symbol": "MSON",
      "name": "MISONIX, Inc."
  },
  {
      "symbol": "MSP",
      "name": "Madison Strategic Sector Premium Fund"
  },
  {
      "symbol": "MSPD",
      "name": "Mindspeed Technologies, Inc."
  },
  {
      "symbol": "MSTR",
      "name": "MicroStrategy Incorporated"
  },
  {
      "symbol": "MSW",
      "name": "Mission West Properties, Inc."
  },
  {
      "symbol": "MSY",
      "name": "Invesco High Yield Investments Fund"
  },
  {
      "symbol": "MSZ",
      "name": "Morgan Stanley"
  },
  {
      "symbol": "MT",
      "name": "ArcelorMittal"
  },
  {
      "symbol": "MTB",
      "name": "M&T Bank Corporation"
  },
  {
      "symbol": "MTB^A",
      "name": "M&T Bank Corporation"
  },
  {
      "symbol": "MTD",
      "name": "Mettler-Toledo International, Inc."
  },
  {
      "symbol": "MTDR",
      "name": "Matador Resources Company"
  },
  {
      "symbol": "MTE",
      "name": "Mahanagar Telephone Nigam Ltd"
  },
  {
      "symbol": "MTEX",
      "name": "Mannatech, Incorporated"
  },
  {
      "symbol": "MTG",
      "name": "MGIC Investment Corporation"
  },
  {
      "symbol": "MTGE",
      "name": "American Capital Mortgage Investment Corp."
  },
  {
      "symbol": "MTH",
      "name": "Meritage Corporation"
  },
  {
      "symbol": "MTL",
      "name": "Mechel Steel Group OAO"
  },
  {
      "symbol": "MTL^",
      "name": "Mechel Steel Group OAO"
  },
  {
      "symbol": "MTN",
      "name": "Vail Resorts, Inc."
  },
  {
      "symbol": "MTOR",
      "name": "Meritor, Inc."
  },
  {
      "symbol": "MTOX",
      "name": "Medtox Scientific, Inc."
  },
  {
      "symbol": "MTP",
      "name": "MLP & Strategic Equity Fund Inc."
  },
  {
      "symbol": "MTR",
      "name": "Mesa Royalty Trust"
  },
  {
      "symbol": "MTRN",
      "name": "Materion Corporation"
  },
  {
      "symbol": "MTRX",
      "name": "Matrix Service Company"
  },
  {
      "symbol": "MTS",
      "name": "Montgomery Street Income Securities, Inc."
  },
  {
      "symbol": "MTSC",
      "name": "MTS Systems Corporation"
  },
  {
      "symbol": "MTSI",
      "name": "M/A-COM Technology Solutions Holdings, Inc."
  },
  {
      "symbol": "MTSL",
      "name": "MER Telemanagement Solutions Ltd."
  },
  {
      "symbol": "MTSN",
      "name": "Mattson Technology, Inc."
  },
  {
      "symbol": "MTT",
      "name": "Western Asset Municipal Defined Opportunity Trust Inc"
  },
  {
      "symbol": "MTU",
      "name": "Mitsubishi UFJ Financial Group Inc"
  },
  {
      "symbol": "MTW",
      "name": "Manitowoc Company, Inc. (The)"
  },
  {
      "symbol": "MTX",
      "name": "Minerals Technologies Inc."
  },
  {
      "symbol": "MTZ",
      "name": "MasTec, Inc."
  },
  {
      "symbol": "MU",
      "name": "Micron Technology, Inc."
  },
  {
      "symbol": "MUA",
      "name": "Blackrock MuniAssets Fund, Inc."
  },
  {
      "symbol": "MUC",
      "name": "Blackrock MuniHoldings California Quality Fund,  Inc."
  },
  {
      "symbol": "MUE",
      "name": "Blackrock MuniHoldings Quality Fund II, Inc."
  },
  {
      "symbol": "MUH",
      "name": "Blackrock MuniHoldings Fund II, Inc."
  },
  {
      "symbol": "MUI",
      "name": "Blackrock Muni Intermediate Duration Fund Inc"
  },
  {
      "symbol": "MUJ",
      "name": "Blackrock MuniHoldings New Jersey Insured Fund, Inc."
  },
  {
      "symbol": "MUR",
      "name": "Murphy Oil Corporation"
  },
  {
      "symbol": "MUS",
      "name": "Blackrock MuniHoldings Quality Fund, Inc."
  },
  {
      "symbol": "MUSA",
      "name": "Metals USA Holdings Corp."
  },
  {
      "symbol": "MUX",
      "name": "McEwen Mining Inc."
  },
  {
      "symbol": "MVC",
      "name": "MVC Capital"
  },
  {
      "symbol": "MVF",
      "name": "MuniVest Fund, Inc."
  },
  {
      "symbol": "MVG",
      "name": "Mag Silver Corporation"
  },
  {
      "symbol": "MVIS",
      "name": "Microvision, Inc."
  },
  {
      "symbol": "MVISW",
      "name": "Microvision, Inc."
  },
  {
      "symbol": "MVO",
      "name": "MV Oil Trust"
  },
  {
      "symbol": "MVT",
      "name": "Blackrock MuniVest Fund II, Inc."
  },
  {
      "symbol": "MW",
      "name": "Men&#39;s Wearhouse, Inc. (The)"
  },
  {
      "symbol": "MWA",
      "name": "MUELLER WATER PRODUCTS"
  },
  {
      "symbol": "MWE",
      "name": "MarkWest Energy Partners, LP"
  },
  {
      "symbol": "MWG",
      "name": "Morgan Stanley"
  },
  {
      "symbol": "MWIV",
      "name": "MWI Veterinary Supply, Inc."
  },
  {
      "symbol": "MWO",
      "name": "Morgan Stanley"
  },
  {
      "symbol": "MWR",
      "name": "Morgan Stanley"
  },
  {
      "symbol": "MWV",
      "name": "Meadwestvaco Corporation"
  },
  {
      "symbol": "MWW",
      "name": "Monster Worldwide, Inc."
  },
  {
      "symbol": "MX",
      "name": "MagnaChip Semiconductor Corporation"
  },
  {
      "symbol": "MXA",
      "name": "Minnesota Municipal Income Portfolio Inc."
  },
  {
      "symbol": "MXC",
      "name": "Mexco Energy Corporation"
  },
  {
      "symbol": "MXE",
      "name": "Mexico Equity and Income Fund, Inc. (The)"
  },
  {
      "symbol": "MXE^",
      "name": "Mexico Equity and Income Fund, Inc. (The)"
  },
  {
      "symbol": "MXF",
      "name": "Mexico Fund, Inc. (The)"
  },
  {
      "symbol": "MXIM",
      "name": "Maxim Integrated Products, Inc."
  },
  {
      "symbol": "MXL",
      "name": "MaxLinear, Inc"
  },
  {
      "symbol": "MXN",
      "name": "First American Minnesota Municipal Income Fund II, Inc."
  },
  {
      "symbol": "MXT",
      "name": "Maxcom Telecomunicaciones SAB de CV"
  },
  {
      "symbol": "MXWL",
      "name": "Maxwell Technologies, Inc."
  },
  {
      "symbol": "MY",
      "name": "China Ming Yang Wind Power Group Limited"
  },
  {
      "symbol": "MYC",
      "name": "Blackrock MuniYield California Fund, Inc."
  },
  {
      "symbol": "MYD",
      "name": "Blackrock MuniYield Fund, Inc."
  },
  {
      "symbol": "MYE",
      "name": "Myers Industries, Inc."
  },
  {
      "symbol": "MYF",
      "name": "Blackrock MuniYield Investment Fund"
  },
  {
      "symbol": "MYGN",
      "name": "Myriad Genetics, Inc."
  },
  {
      "symbol": "MYI",
      "name": "Blackrock MuniYield Quality Fund III, Inc."
  },
  {
      "symbol": "MYJ",
      "name": "Blackrock MuniYield New Jersey Fund, Inc."
  },
  {
      "symbol": "MYL",
      "name": "Mylan Inc."
  },
  {
      "symbol": "MYM",
      "name": "Blackrock MuniYield Michigan Quality Fund II, Inc."
  },
  {
      "symbol": "MYN",
      "name": "Blackrock MuniYield New York Quality Fund, Inc."
  },
  {
      "symbol": "MYRG",
      "name": "MYR Group, Inc."
  },
  {
      "symbol": "MYRX",
      "name": "Myrexis, Inc"
  },
  {
      "symbol": "MZA",
      "name": "MuniYield Arizona Fund, Inc."
  },
  {
      "symbol": "MZF",
      "name": "Managed Duration Investment Grade Municipal Fund"
  },
  {
      "symbol": "N",
      "name": "Netsuite Inc"
  },
  {
      "symbol": "NABI",
      "name": "Nabi Biopharmaceuticals"
  },
  {
      "symbol": "NAC",
      "name": "Nuveen California Dividend Advantage Municipal Fund"
  },
  {
      "symbol": "NAD",
      "name": "Nuveen Dividend Advantage Municipal Fund"
  },
  {
      "symbol": "NAD^C",
      "name": "Nuveen Dividend Advantage Municipal Fund"
  },
  {
      "symbol": "NAFC",
      "name": "Nash-Finch Company"
  },
  {
      "symbol": "NAI",
      "name": "AGIC International & Premium Strategy Fund"
  },
  {
      "symbol": "NAII",
      "name": "Natural Alternatives International, Inc."
  },
  {
      "symbol": "NAK",
      "name": "Northern Dynasty Minerals, Ltd."
  },
  {
      "symbol": "NAN",
      "name": "Nuveen New York Dividend Advantage Municipal Fund"
  },
  {
      "symbol": "NAN^C",
      "name": "Nuveen New York Dividend Advantage Municipal Fund"
  },
  {
      "symbol": "NAN^D",
      "name": "Nuveen New York Dividend Advantage Municipal Fund"
  },
  {
      "symbol": "NANO",
      "name": "Nanometrics Incorporated"
  },
  {
      "symbol": "NASB",
      "name": "NASB Financial Inc."
  },
  {
      "symbol": "NAT",
      "name": "Nordic American Tankers Limited"
  },
  {
      "symbol": "NATH",
      "name": "Nathan&#39;s Famous, Inc."
  },
  {
      "symbol": "NATI",
      "name": "National Instruments Corporation"
  },
  {
      "symbol": "NATL",
      "name": "National Interstate Corporation"
  },
  {
      "symbol": "NATR",
      "name": "Nature&#39;s Sunshine Products, Inc."
  },
  {
      "symbol": "NAUH",
      "name": "National American University Holdings, Inc."
  },
  {
      "symbol": "NAV",
      "name": "Navistar International Corporation"
  },
  {
      "symbol": "NAV^D",
      "name": "Navistar International Corporation"
  },
  {
      "symbol": "NAVB",
      "name": "Navidea Biopharmaceuticals, Inc."
  },
  {
      "symbol": "NAVG",
      "name": "The Navigators Group, Inc."
  },
  {
      "symbol": "NAVR",
      "name": "Navarre Corporation"
  },
  {
      "symbol": "NAZ",
      "name": "Nuveen Arizona Premium Income Municipal Fund, Inc."
  },
  {
      "symbol": "NBB",
      "name": "Nuveen Build America Bond Fund"
  },
  {
      "symbol": "NBBC",
      "name": "NewBridge Bancorp"
  },
  {
      "symbol": "NBD",
      "name": "Nuveen Build America Bond Opportunity Fund"
  },
  {
      "symbol": "NBG",
      "name": "National Bank of Greece SA"
  },
  {
      "symbol": "NBG^A",
      "name": "National Bank of Greece SA"
  },
  {
      "symbol": "NBH",
      "name": "Neuberger Berman Intermediate Municipal Fund Inc."
  },
  {
      "symbol": "NBIX",
      "name": "Neurocrine Biosciences, Inc."
  },
  {
      "symbol": "NBJ",
      "name": "Nuveen Ohio Dividend Advantage Municipal Fund 2"
  },
  {
      "symbol": "NBJ^A",
      "name": "Nuveen Ohio Dividend Advantage Municipal Fund 2"
  },
  {
      "symbol": "NBL",
      "name": "Noble Energy Inc."
  },
  {
      "symbol": "NBN",
      "name": "Northeast Bancorp"
  },
  {
      "symbol": "NBO",
      "name": "Neuberger Berman New York Intermediate Municipal Fund Inc."
  },
  {
      "symbol": "NBR",
      "name": "Nabors Industries Ltd."
  },
  {
      "symbol": "NBS",
      "name": "Neostem, Inc."
  },
  {
      "symbol": "NBS/WS",
      "name": "Neostem, Inc."
  },
  {
      "symbol": "NBTB",
      "name": "NBT Bancorp Inc."
  },
  {
      "symbol": "NBTF",
      "name": "NB&T FINANCIAL GROUP INC"
  },
  {
      "symbol": "NBW",
      "name": "Neuberger Berman California Intermediate Municipal Fund Inc."
  },
  {
      "symbol": "NBY",
      "name": "NovaBay Pharmaceuticals, Inc."
  },
  {
      "symbol": "NC",
      "name": "NACCO Industries, Inc."
  },
  {
      "symbol": "NCA",
      "name": "Nuveen California Municipal Value Fund, Inc."
  },
  {
      "symbol": "NCB",
      "name": "Nuveen California Municipal Value Fund 2"
  },
  {
      "symbol": "NCBC",
      "name": "New Century Bancorp, Inc. (NC)"
  },
  {
      "symbol": "NCC^B/CL",
      "name": "National City Corporation"
  },
  {
      "symbol": "NCC^C",
      "name": "National City Corporation"
  },
  {
      "symbol": "NCI",
      "name": "Navigant Consulting, Inc."
  },
  {
      "symbol": "NCIT",
      "name": "NCI, Inc."
  },
  {
      "symbol": "NCL",
      "name": "Nuveen Insured California Premium Income Municipal Fund II, In"
  },
  {
      "symbol": "NCMI",
      "name": "National CineMedia, Inc."
  },
  {
      "symbol": "NCO",
      "name": "Nuveen California Municipal Market Opportunity Fund, Inc."
  },
  {
      "symbol": "NCP",
      "name": "Nuveen California Performance Plus Municipal Fund, Inc."
  },
  {
      "symbol": "NCQ",
      "name": "NovaCopper Inc."
  },
  {
      "symbol": "NCR",
      "name": "NCR Corporation"
  },
  {
      "symbol": "NCS",
      "name": "NCI Building Systems, Inc."
  },
  {
      "symbol": "NCT",
      "name": "Newcastle Investment Corporation"
  },
  {
      "symbol": "NCT^B",
      "name": "Newcastle Investment Corporation"
  },
  {
      "symbol": "NCT^C",
      "name": "Newcastle Investment Corporation"
  },
  {
      "symbol": "NCT^D",
      "name": "Newcastle Investment Corporation"
  },
  {
      "symbol": "NCTY",
      "name": "The9 Limited"
  },
  {
      "symbol": "NCU",
      "name": "Nuveen California Premium Income Municipal Fund"
  },
  {
      "symbol": "NCU^C",
      "name": "Nuveen California Premium Income Municipal Fund"
  },
  {
      "symbol": "NCV",
      "name": "AGIC Convertible & Income Fund"
  },
  {
      "symbol": "NCZ",
      "name": "AGIC Convertible & Income Fund II"
  },
  {
      "symbol": "NDAQ",
      "name": "The NASDAQ OMX Group, Inc."
  },
  {
      "symbol": "NDRO",
      "name": "Enduro Royalty Trust"
  },
  {
      "symbol": "NDSN",
      "name": "Nordson Corporation"
  },
  {
      "symbol": "NDZ",
      "name": "Nordion Inc."
  },
  {
      "symbol": "NE",
      "name": "Noble Corporation"
  },
  {
      "symbol": "NEA",
      "name": "Nuveen AMT-Free Municipal Income Fund"
  },
  {
      "symbol": "NEA^C",
      "name": "Nuveen AMT-Free Municipal Income Fund"
  },
  {
      "symbol": "NEBS",
      "name": "New England Bancshares, Inc."
  },
  {
      "symbol": "NECB",
      "name": "Northeast Community Bancorp, Inc."
  },
  {
      "symbol": "NED",
      "name": "Noah Education Holdings Ltd."
  },
  {
      "symbol": "NEE",
      "name": "NextEra Energy, Inc."
  },
  {
      "symbol": "NEE^C",
      "name": "NextEra Energy, Inc."
  },
  {
      "symbol": "NEE^F",
      "name": "NextEra Energy, Inc."
  },
  {
      "symbol": "NEE^G",
      "name": "NextEra Energy, Inc."
  },
  {
      "symbol": "NEI",
      "name": "Network Engines, Inc"
  },
  {
      "symbol": "NEM",
      "name": "Newmont Mining Corporation (Holding Company)"
  },
  {
      "symbol": "NEN",
      "name": "New England Realty Associates Limited Partnership"
  },
  {
      "symbol": "NEOG",
      "name": "Neogen Corporation"
  },
  {
      "symbol": "NEON",
      "name": "Neonode Inc."
  },
  {
      "symbol": "NEP",
      "name": "China North East Petroleum Holdings Limited"
  },
  {
      "symbol": "NEPT",
      "name": "Neptune Technologies & Bioresources Inc"
  },
  {
      "symbol": "NETC",
      "name": "NET Servicos de Comunicacao S.A."
  },
  {
      "symbol": "NEU",
      "name": "NewMarket Corporation"
  },
  {
      "symbol": "NEV",
      "name": "Nuveen Enhanced Municipal Value Fund"
  },
  {
      "symbol": "NEWL",
      "name": "NewLead Holdings Ltd."
  },
  {
      "symbol": "NEWN",
      "name": "New Energy Systems Group."
  },
  {
      "symbol": "NEWP",
      "name": "Newport Corporation"
  },
  {
      "symbol": "NEWS",
      "name": "NewStar Financial, Inc."
  },
  {
      "symbol": "NEWT",
      "name": "Newtek Business Services Inc."
  },
  {
      "symbol": "NEXS",
      "name": "Nexxus Lighting, Inc."
  },
  {
      "symbol": "NFBK",
      "name": "Northfield Bancorp, Inc."
  },
  {
      "symbol": "NFC",
      "name": "Nuveen Connecticut Dividend Advantage Municipal Fund"
  },
  {
      "symbol": "NFC^C",
      "name": "Nuveen Connecticut Dividend Advantage Municipal Fund"
  },
  {
      "symbol": "NFEC",
      "name": "NF Energy Saving Corporation"
  },
  {
      "symbol": "NFG",
      "name": "National Fuel Gas Company"
  },
  {
      "symbol": "NFJ",
      "name": "NFJ Dividend, Interest & Premium Strategy Fund"
  },
  {
      "symbol": "NFLX",
      "name": "Netflix, Inc."
  },
  {
      "symbol": "NFM",
      "name": "Nuveen Maryland Dividend Advantage Municipal Fund"
  },
  {
      "symbol": "NFM^C",
      "name": "Nuveen Maryland Dividend Advantage Municipal Fund"
  },
  {
      "symbol": "NFP",
      "name": "National Financial Partners Corporation"
  },
  {
      "symbol": "NFSB",
      "name": "Newport Bancorp, Inc."
  },
  {
      "symbol": "NFX",
      "name": "Newfield Exploration Company"
  },
  {
      "symbol": "NFZ",
      "name": "Nuveen Arizona Dividend Advantage Municipal Fund"
  },
  {
      "symbol": "NFZ^C",
      "name": "Nuveen Arizona Dividend Advantage Municipal Fund"
  },
  {
      "symbol": "NG",
      "name": "Novagold Resources Inc New"
  },
  {
      "symbol": "NGB",
      "name": "Nuveen Virginia Dividend Advantage Municipal Fund"
  },
  {
      "symbol": "NGB^C",
      "name": "Nuveen Virginia Dividend Advantage Municipal Fund"
  },
  {
      "symbol": "NGD",
      "name": "NEW GOLD INC."
  },
  {
      "symbol": "NGG",
      "name": "National Grid Transco, PLC"
  },
  {
      "symbol": "NGK",
      "name": "Nuveen Connecticut Dividend Advantage Municipal Fund 2"
  },
  {
      "symbol": "NGK^C",
      "name": "Nuveen Connecticut Dividend Advantage Municipal Fund 2"
  },
  {
      "symbol": "NGL",
      "name": "NGL ENERGY PARTNERS LP"
  },
  {
      "symbol": "NGLS",
      "name": "Targa Resources Partners LP"
  },
  {
      "symbol": "NGO",
      "name": "Nuveen Connecticut Dividend Advantage Municipal Fund 3"
  },
  {
      "symbol": "NGO^C",
      "name": "Nuveen Connecticut Dividend Advantage Municipal Fund 3"
  },
  {
      "symbol": "NGPC",
      "name": "NGP Capital Resources Company"
  },
  {
      "symbol": "NGS",
      "name": "Natural Gas Services Group, Inc."
  },
  {
      "symbol": "NGSX",
      "name": "NeurogesX, Inc."
  },
  {
      "symbol": "NGT",
      "name": "Eastern American Natural Gas Trust"
  },
  {
      "symbol": "NGX",
      "name": "Nuveen Insured Massachusetts Tax-Free Advantage Municipal Fund"
  },
  {
      "symbol": "NGX^C",
      "name": "Nuveen Insured Massachusetts Tax-Free Advantage Municipal Fund"
  },
  {
      "symbol": "NGZ",
      "name": "AGIC Global Equity & Convertible Income Fund"
  },
  {
      "symbol": "NHC",
      "name": "National HealthCare Corporation"
  },
  {
      "symbol": "NHC^A",
      "name": "National HealthCare Corporation"
  },
  {
      "symbol": "NHI",
      "name": "National Health Investors, Inc."
  },
  {
      "symbol": "NHS",
      "name": "Neuberger Berman High Yield Strategies Fund"
  },
  {
      "symbol": "NHTB",
      "name": "New Hampshire Thrift Bancshares, Inc."
  },
  {
      "symbol": "NI",
      "name": "NiSource, Inc"
  },
  {
      "symbol": "NICE",
      "name": "NICE-Systems Limited"
  },
  {
      "symbol": "NICK",
      "name": "Nicholas Financial, Inc."
  },
  {
      "symbol": "NIE",
      "name": "AGIC Equity & Convertible Income Fund"
  },
  {
      "symbol": "NIF",
      "name": "Nuveen Premier Municipal Opportunity Fund, Inc."
  },
  {
      "symbol": "NIHD",
      "name": "NII Holdings, Inc."
  },
  {
      "symbol": "NII",
      "name": "Nuveen North Carolina Dividend Advantage Municipal Fund 3"
  },
  {
      "symbol": "NII^C",
      "name": "Nuveen North Carolina Dividend Advantage Municipal Fund 3"
  },
  {
      "symbol": "NILE",
      "name": "Blue Nile, Inc."
  },
  {
      "symbol": "NIM",
      "name": "Nuveen Select Maturities Municipal Fund"
  },
  {
      "symbol": "NINE",
      "name": "Ninetowns Internet Technology Group Company Limited"
  },
  {
      "symbol": "NIO",
      "name": "Nuveen Municipal Opportunity Fund, Inc."
  },
  {
      "symbol": "NJ",
      "name": "Nidec Corporation (Nihon Densan Kabushiki Kaisha)"
  },
  {
      "symbol": "NJR",
      "name": "NewJersey Resources Corporation"
  },
  {
      "symbol": "NJV",
      "name": "Nuveen New Jersey Municipal Value Fund"
  },
  {
      "symbol": "NKA",
      "name": "Niska Gas Storage Partners LLC"
  },
  {
      "symbol": "NKBP",
      "name": "China Nuokang Bio-Pharmaceutical Inc."
  },
  {
      "symbol": "NKE",
      "name": "Nike, Inc."
  },
  {
      "symbol": "NKG",
      "name": "Nuveen Georgia Dividend Advantage Municipal Fund 2"
  },
  {
      "symbol": "NKG^C",
      "name": "Nuveen Georgia Dividend Advantage Municipal Fund 2"
  },
  {
      "symbol": "NKL",
      "name": "Nuveen Insured California Dividend Advantage Municipal Fund"
  },
  {
      "symbol": "NKO",
      "name": "Nuveen New York Dividend Advantage Municipal Income Fund"
  },
  {
      "symbol": "NKR",
      "name": "Nuveen Arizona Dividend Advantage Municipal Fund 2"
  },
  {
      "symbol": "NKR^C",
      "name": "Nuveen Arizona Dividend Advantage Municipal Fund 2"
  },
  {
      "symbol": "NKSH",
      "name": "National Bankshares, Inc."
  },
  {
      "symbol": "NKTR",
      "name": "Nektar Therapeutics"
  },
  {
      "symbol": "NKX",
      "name": "Nuveen Insured California Tax-Free Advantage Municipal Fund"
  },
  {
      "symbol": "NL",
      "name": "NL Industries, Inc."
  },
  {
      "symbol": "NLNK",
      "name": "NewLink Genetics Corporation"
  },
  {
      "symbol": "NLP",
      "name": "NTS Realty Holdings Limited Partnership"
  },
  {
      "symbol": "NLS",
      "name": "Nautilus Group, Inc. (The)"
  },
  {
      "symbol": "NLSN",
      "name": "Nielsen Holdings N.V."
  },
  {
      "symbol": "NLST",
      "name": "Netlist, Inc."
  },
  {
      "symbol": "NLY",
      "name": "Annaly Capital Management Inc"
  },
  {
      "symbol": "NLY^A",
      "name": "Annaly Capital Management Inc"
  },
  {
      "symbol": "NM",
      "name": "Navios Maritime Holdings Inc."
  },
  {
      "symbol": "NMA",
      "name": "Nuveen Municipal Advantage Fund, Inc."
  },
  {
      "symbol": "NMAR",
      "name": "Nautilus Marine Acquisition Corp."
  },
  {
      "symbol": "NMARW",
      "name": "Nautilus Marine Acquisition Corp."
  },
  {
      "symbol": "NMB",
      "name": "Nuveen Massachusetts Dividend Advantage Municipal Fund"
  },
  {
      "symbol": "NMB^C",
      "name": "Nuveen Massachusetts Dividend Advantage Municipal Fund"
  },
  {
      "symbol": "NMD",
      "name": "Nuveen Municipal High Income Opportunity Fund"
  },
  {
      "symbol": "NMFC",
      "name": "New Mountain Finance Corporation"
  },
  {
      "symbol": "NMI",
      "name": "Nuveen Municipal Income Fund, Inc."
  },
  {
      "symbol": "NMK^B",
      "name": "Niagara Mohawk Holdings, Inc."
  },
  {
      "symbol": "NMK^C",
      "name": "Niagara Mohawk Holdings, Inc."
  },
  {
      "symbol": "NMM",
      "name": "Navios Maritime Partners LP"
  },
  {
      "symbol": "NMO",
      "name": "Nuveen Municipal Market Opportunity Fund, Inc."
  },
  {
      "symbol": "NMP",
      "name": "Nuveen Michigan Premium Income Municipal Fund, Inc."
  },
  {
      "symbol": "NMR",
      "name": "Nomura Holdings Inc ADR"
  },
  {
      "symbol": "NMRX",
      "name": "Numerex Corp."
  },
  {
      "symbol": "NMT",
      "name": "Nuveen Massachusetts Premium Income Municipal Fund"
  },
  {
      "symbol": "NMT^C",
      "name": "Nuveen Massachusetts Premium Income Municipal Fund"
  },
  {
      "symbol": "NMT^D",
      "name": "Nuveen Massachusetts Premium Income Municipal Fund"
  },
  {
      "symbol": "NMY",
      "name": "Nuveen Maryland Premium Income Municipal Fund"
  },
  {
      "symbol": "NMY^C",
      "name": "Nuveen Maryland Premium Income Municipal Fund"
  },
  {
      "symbol": "NMY^D",
      "name": "Nuveen Maryland Premium Income Municipal Fund"
  },
  {
      "symbol": "NMZ",
      "name": "Nuveen Municipal High Income Opportunity Fund"
  },
  {
      "symbol": "NNA",
      "name": "Navios Maritime Acquisition Corporation"
  },
  {
      "symbol": "NNA/U",
      "name": "Navios Maritime Acquisition Corporation"
  },
  {
      "symbol": "NNA/WS",
      "name": "Navios Maritime Acquisition Corporation"
  },
  {
      "symbol": "NNB",
      "name": "Nuveen Virginia Dividend Advantage Municipal Fund 2"
  },
  {
      "symbol": "NNB^C",
      "name": "Nuveen Virginia Dividend Advantage Municipal Fund 2"
  },
  {
      "symbol": "NNBR",
      "name": "NN, Inc."
  },
  {
      "symbol": "NNC",
      "name": "Nuveen North Carolina Premium Income Municipal Fund"
  },
  {
      "symbol": "NNC^C",
      "name": "Nuveen North Carolina Premium Income Municipal Fund"
  },
  {
      "symbol": "NNC^D",
      "name": "Nuveen North Carolina Premium Income Municipal Fund"
  },
  {
      "symbol": "NNF",
      "name": "Nuveen New York Premium Income Municipal Fund, Inc."
  },
  {
      "symbol": "NNI",
      "name": "Nelnet, Inc."
  },
  {
      "symbol": "NNJ",
      "name": "Nuveen New Jersey Premium Income Municipal Fund, Inc."
  },
  {
      "symbol": "NNN",
      "name": "National Retail Properties"
  },
  {
      "symbol": "NNN^D",
      "name": "National Retail Properties"
  },
  {
      "symbol": "NNO",
      "name": "Nuveen North Carolina Dividend Advantage Municipal Fund 2"
  },
  {
      "symbol": "NNO^C",
      "name": "Nuveen North Carolina Dividend Advantage Municipal Fund 2"
  },
  {
      "symbol": "NNP",
      "name": "Nuveen New York Performance Plus Municipal Fund, Inc."
  },
  {
      "symbol": "NNY",
      "name": "Nuveen New York Municipal Value Fund, Inc."
  },
  {
      "symbol": "NOA",
      "name": "North American Energy Partners, Inc."
  },
  {
      "symbol": "NOAH",
      "name": "Noah Holdings Ltd."
  },
  {
      "symbol": "NOBH",
      "name": "Nobility Homes, Inc."
  },
  {
      "symbol": "NOC",
      "name": "Northrop Grumman Corporation"
  },
  {
      "symbol": "NOG",
      "name": "Northern Oil and Gas, Inc."
  },
  {
      "symbol": "NOIZ",
      "name": "Micronetics, Inc."
  },
  {
      "symbol": "NOK",
      "name": "Nokia Corporation"
  },
  {
      "symbol": "NOM",
      "name": "Nuveen Missouri Premium Income Municipal Fund"
  },
  {
      "symbol": "NOM^C",
      "name": "Nuveen Missouri Premium Income Municipal Fund"
  },
  {
      "symbol": "NOOF",
      "name": "New Frontier Media, Inc."
  },
  {
      "symbol": "NOR",
      "name": "Noranda Aluminum Holding Corporation"
  },
  {
      "symbol": "NOV",
      "name": "National-Oilwell, Inc."
  },
  {
      "symbol": "NOVB",
      "name": "North Valley Bancorp"
  },
  {
      "symbol": "NP",
      "name": "Neenah Paper, Inc."
  },
  {
      "symbol": "NPBC",
      "name": "National Penn Bancshares, Inc."
  },
  {
      "symbol": "NPBCO",
      "name": "National Penn Bancshares, Inc."
  },
  {
      "symbol": "NPC",
      "name": "Nuveen Insured California Premium Income Fund, Inc."
  },
  {
      "symbol": "NPD",
      "name": "China Nepstar Chain Drugstore Ltd"
  },
  {
      "symbol": "NPF",
      "name": "Nuveen Premier Municipal Income Fund, Inc."
  },
  {
      "symbol": "NPG",
      "name": "Nuveen Georgia Premium Income Municipal Fund"
  },
  {
      "symbol": "NPG^C",
      "name": "Nuveen Georgia Premium Income Municipal Fund"
  },
  {
      "symbol": "NPI",
      "name": "Nuveen Premium Income Municipal Fund, Inc."
  },
  {
      "symbol": "NPK",
      "name": "National Presto Industries, Inc."
  },
  {
      "symbol": "NPM",
      "name": "Nuveen Premium Income Municipal Fund II, Inc."
  },
  {
      "symbol": "NPN",
      "name": "Nuveen Pennsylvania Municipal Value Fund"
  },
  {
      "symbol": "NPO",
      "name": "Enpro Industries"
  },
  {
      "symbol": "NPP",
      "name": "Nuveen Performance Plus Municipal Fund, Inc."
  },
  {
      "symbol": "NPSP",
      "name": "NPS Pharmaceuticals, Inc."
  },
  {
      "symbol": "NPT",
      "name": "Nuveen Premium Income Municipal Fund IV, Inc."
  },
  {
      "symbol": "NPTN",
      "name": "NeoPhotonics Corporation"
  },
  {
      "symbol": "NPV",
      "name": "Nuveen Virginia Premium Income Municipal Fund"
  },
  {
      "symbol": "NPV^A",
      "name": "Nuveen Virginia Premium Income Municipal Fund"
  },
  {
      "symbol": "NPV^C",
      "name": "Nuveen Virginia Premium Income Municipal Fund"
  },
  {
      "symbol": "NPX",
      "name": "Nuveen Premium Income Municipal Opportunity Fund"
  },
  {
      "symbol": "NPY",
      "name": "Nuveen Pennsylvania Premium Income Municipal Fund II"
  },
  {
      "symbol": "NQ",
      "name": "NQ Mobile Inc."
  },
  {
      "symbol": "NQC",
      "name": "Nuveen California Investment Quality Municipal Fund, Inc."
  },
  {
      "symbol": "NQI",
      "name": "Nuveen Quality Municipal Fund, Inc."
  },
  {
      "symbol": "NQJ",
      "name": "Nuveen New Jersey Investment Quality Municipal Fund, Inc."
  },
  {
      "symbol": "NQM",
      "name": "Nuveen Investment Quality Municipal Fund, Inc."
  },
  {
      "symbol": "NQN",
      "name": "Nuveen New York Investment Quality Municipal Fund, Inc."
  },
  {
      "symbol": "NQP",
      "name": "Nuveen Pennsylvania Investment Quality Municipal Fund, Inc."
  },
  {
      "symbol": "NQS",
      "name": "Nuveen Select Quality Municipal Fund, Inc."
  },
  {
      "symbol": "NQU",
      "name": "Nuveen Quality Income Municipal Fund, Inc."
  },
  {
      "symbol": "NR",
      "name": "Newpark Resources, Inc."
  },
  {
      "symbol": "NRB",
      "name": "Nuveen North Carolina Dividend Advantage Municipal Fund"
  },
  {
      "symbol": "NRB^C",
      "name": "Nuveen North Carolina Dividend Advantage Municipal Fund"
  },
  {
      "symbol": "NRC",
      "name": "National Rural Utilities Cooperative Finance Corp"
  },
  {
      "symbol": "NRCI",
      "name": "National Research Corporation"
  },
  {
      "symbol": "NRF",
      "name": "Northstar Realty Finance Corp."
  },
  {
      "symbol": "NRF^A",
      "name": "Northstar Realty Finance Corp."
  },
  {
      "symbol": "NRF^B",
      "name": "Northstar Realty Finance Corp."
  },
  {
      "symbol": "NRG",
      "name": "NRG Energy, Inc."
  },
  {
      "symbol": "NRGM",
      "name": "Inergy Midstream, L.P."
  },
  {
      "symbol": "NRGY",
      "name": "Inergy, L.P."
  },
  {
      "symbol": "NRIM",
      "name": "Northrim BanCorp Inc"
  },
  {
      "symbol": "NRK",
      "name": "Nuveen New York AMT-Free Municipal Income Fund"
  },
  {
      "symbol": "NRK^C",
      "name": "Nuveen New York AMT-Free Municipal Income Fund"
  },
  {
      "symbol": "NRKM",
      "name": "Enerkem Inc."
  },
  {
      "symbol": "NRO",
      "name": "Neuberger Berman Real Estate Securities Income Fund, Inc."
  },
  {
      "symbol": "NRP",
      "name": "Natural Resource Partners LP"
  },
  {
      "symbol": "NRT",
      "name": "North European Oil Royality Trust"
  },
  {
      "symbol": "NRU",
      "name": "National Rural Utilities Cooperative Finance Corp"
  },
  {
      "symbol": "NS",
      "name": "Nustar Energy L.P."
  },
  {
      "symbol": "NSC",
      "name": "Norfolk Souther Corporation"
  },
  {
      "symbol": "NSEC",
      "name": "National Security Group, Inc."
  },
  {
      "symbol": "NSH",
      "name": "Nustar GP Holdings, LLC"
  },
  {
      "symbol": "NSIT",
      "name": "Insight Enterprises, Inc."
  },
  {
      "symbol": "NSL",
      "name": "Nuveen Senior Income Fund"
  },
  {
      "symbol": "NSM",
      "name": "Nationstar Mortgage Holdings Inc."
  },
  {
      "symbol": "NSP",
      "name": "Insperity, Inc."
  },
  {
      "symbol": "NSPH",
      "name": "Nanosphere, Inc."
  },
  {
      "symbol": "NSR",
      "name": "Neustar, Inc."
  },
  {
      "symbol": "NSSC",
      "name": "NAPCO Security Technologies, Inc."
  },
  {
      "symbol": "NSU",
      "name": "Nevsun Resources Ltd"
  },
  {
      "symbol": "NSYS",
      "name": "Nortech Systems Incorporated"
  },
  {
      "symbol": "NTAP",
      "name": "NetApp, Inc."
  },
  {
      "symbol": "NTC",
      "name": "Nuveen Connecticut Premium Income Municipal Fund"
  },
  {
      "symbol": "NTC^C",
      "name": "Nuveen Connecticut Premium Income Municipal Fund"
  },
  {
      "symbol": "NTC^D",
      "name": "Nuveen Connecticut Premium Income Municipal Fund"
  },
  {
      "symbol": "NTCT",
      "name": "NetScout Systems, Inc."
  },
  {
      "symbol": "NTE",
      "name": "Nam Tai Electronics, Inc."
  },
  {
      "symbol": "NTES",
      "name": "NetEase, Inc."
  },
  {
      "symbol": "NTG",
      "name": "Tortoise MLP Fund, Inc."
  },
  {
      "symbol": "NTGR",
      "name": "NETGEAR, Inc."
  },
  {
      "symbol": "NTIC",
      "name": "Northern Technologies International Corporation"
  },
  {
      "symbol": "NTK",
      "name": "Nortek Inc."
  },
  {
      "symbol": "NTL",
      "name": "Nortel Inversora SA, ADR"
  },
  {
      "symbol": "NTLS",
      "name": "NTELOS Holdings Corp."
  },
  {
      "symbol": "NTN",
      "name": "NTN Buzztime, Inc."
  },
  {
      "symbol": "NTRI",
      "name": "NutriSystem Inc"
  },
  {
      "symbol": "NTRS",
      "name": "Northern Trust Corporation"
  },
  {
      "symbol": "NTS",
      "name": "NTS, Inc."
  },
  {
      "symbol": "NTSC",
      "name": "National Technical Systems, Inc."
  },
  {
      "symbol": "NTSP",
      "name": "NetSpend Holdings, Inc."
  },
  {
      "symbol": "NTT",
      "name": "Nippon Telegraph and Telephone Corporation"
  },
  {
      "symbol": "NTWK",
      "name": "NetSol Technologies Inc."
  },
  {
      "symbol": "NTX",
      "name": "Nuveen Texas Quality Income Municipal Fund"
  },
  {
      "symbol": "NTX^C",
      "name": "Nuveen Texas Quality Income Municipal Fund"
  },
  {
      "symbol": "NTZ",
      "name": "Natuzzi, S.p.A."
  },
  {
      "symbol": "NU",
      "name": "Northeast Utilities"
  },
  {
      "symbol": "NUAN",
      "name": "Nuance Communications, Inc."
  },
  {
      "symbol": "NUC",
      "name": "Nuveen California Quality Income Municipal Fund, Inc."
  },
  {
      "symbol": "NUCL",
      "name": "iShares S&P Global Nuclear Index Fund"
  },
  {
      "symbol": "NUE",
      "name": "Nucor Corporation"
  },
  {
      "symbol": "NUJ",
      "name": "Nuveen New Jersey Dividend Advantage Municipal Fund 2"
  },
  {
      "symbol": "NUJ^C",
      "name": "Nuveen New Jersey Dividend Advantage Municipal Fund 2"
  },
  {
      "symbol": "NUM",
      "name": "Nuveen Michigan Quality Income Municipal Fund, Inc."
  },
  {
      "symbol": "NUN",
      "name": "Nuveen New York Quality Income Municipal Fund, Inc."
  },
  {
      "symbol": "NUO",
      "name": "Nuveen Ohio Quality Income Municipal Fund, Inc."
  },
  {
      "symbol": "NURO",
      "name": "NeuroMetrix, Inc."
  },
  {
      "symbol": "NUS",
      "name": "Nu Skin Enterprises, Inc."
  },
  {
      "symbol": "NUTR",
      "name": "Nutraceutical International Corporation"
  },
  {
      "symbol": "NUV",
      "name": "Nuveen Municipal Value Fund, Inc."
  },
  {
      "symbol": "NUVA",
      "name": "NuVasive, Inc."
  },
  {
      "symbol": "NUW",
      "name": "Nuveen Municipal Value Fund, Inc."
  },
  {
      "symbol": "NVAX",
      "name": "Novavax, Inc."
  },
  {
      "symbol": "NVC",
      "name": "Nuveen California Select Quality Municipal Fund, Inc."
  },
  {
      "symbol": "NVDA",
      "name": "NVIDIA Corporation"
  },
  {
      "symbol": "NVDQ",
      "name": "Novadaq Technologies Inc"
  },
  {
      "symbol": "NVE",
      "name": "NV Energy, Inc"
  },
  {
      "symbol": "NVEC",
      "name": "NVE Corporation"
  },
  {
      "symbol": "NVG",
      "name": "Nuveen Dividend Advantage Municipal Income Fund"
  },
  {
      "symbol": "NVG^C",
      "name": "Nuveen Dividend Advantage Municipal Income Fund"
  },
  {
      "symbol": "NVGN",
      "name": "Novogen Limited"
  },
  {
      "symbol": "NVJ",
      "name": "Nuveen Ohio Dividend Advantage Municipal Fund 3"
  },
  {
      "symbol": "NVJ^A",
      "name": "Nuveen Ohio Dividend Advantage Municipal Fund 3"
  },
  {
      "symbol": "NVLS",
      "name": "Novellus Systems, Inc."
  },
  {
      "symbol": "NVMI",
      "name": "Nova Measuring Instruments Ltd."
  },
  {
      "symbol": "NVN",
      "name": "Nuveen New York Select Quality Municipal Fund, Inc."
  },
  {
      "symbol": "NVO",
      "name": "Novo Nordisk A/S"
  },
  {
      "symbol": "NVR",
      "name": "NVR, Inc."
  },
  {
      "symbol": "NVS",
      "name": "Novartis AG"
  },
  {
      "symbol": "NVSL",
      "name": "Naugatuck Valley Financial Corporation"
  },
  {
      "symbol": "NVTL",
      "name": "Novatel Wireless, Inc."
  },
  {
      "symbol": "NVX",
      "name": "Nuveen California Dividend Advantage Municipal Fund 2"
  },
  {
      "symbol": "NVX^A",
      "name": "Nuveen California Dividend Advantage Municipal Fund 2"
  },
  {
      "symbol": "NVX^C",
      "name": "Nuveen California Dividend Advantage Municipal Fund 2"
  },
  {
      "symbol": "NVY",
      "name": "Nuveen Pennsylvania Dividend Advantage Municipal Fund 2"
  },
  {
      "symbol": "NVY^C",
      "name": "Nuveen Pennsylvania Dividend Advantage Municipal Fund 2"
  },
  {
      "symbol": "NW^C",
      "name": "Natl Westminster Pfd"
  },
  {
      "symbol": "NWBI",
      "name": "Northwest Bancshares, Inc."
  },
  {
      "symbol": "NWE",
      "name": "NorthWestern Corporation"
  },
  {
      "symbol": "NWFL",
      "name": "Norwood Financial Corp."
  },
  {
      "symbol": "NWI",
      "name": "Nuveen Maryland Dividend Advantage Municipal Fund 3"
  },
  {
      "symbol": "NWI^C",
      "name": "Nuveen Maryland Dividend Advantage Municipal Fund 3"
  },
  {
      "symbol": "NWI^D",
      "name": "Nuveen Maryland Dividend Advantage Municipal Fund 3"
  },
  {
      "symbol": "NWK",
      "name": "Network Equipment Technologies, Inc."
  },
  {
      "symbol": "NWL",
      "name": "Newell Rubbermaid Inc."
  },
  {
      "symbol": "NWLI",
      "name": "National Western Life Insurance Company"
  },
  {
      "symbol": "NWN",
      "name": "Northwest Natural Gas Company"
  },
  {
      "symbol": "NWPX",
      "name": "Northwest Pipe Company"
  },
  {
      "symbol": "NWS",
      "name": "News Corporation"
  },
  {
      "symbol": "NWSA",
      "name": "News Corporation"
  },
  {
      "symbol": "NWY",
      "name": "New York & Company, Inc."
  },
  {
      "symbol": "NX",
      "name": "Quanex Building Products Corporation"
  },
  {
      "symbol": "NXC",
      "name": "Nuveen Insured California Select Tax-Free Income Portfolio"
  },
  {
      "symbol": "NXE",
      "name": "Nuveen Arizona Dividend Advantage Municipal Fund 3"
  },
  {
      "symbol": "NXE^C",
      "name": "Nuveen Arizona Dividend Advantage Municipal Fund 3"
  },
  {
      "symbol": "NXI",
      "name": "Nuveen Ohio Dividend Advantage Municipal Fund"
  },
  {
      "symbol": "NXI^C",
      "name": "Nuveen Ohio Dividend Advantage Municipal Fund"
  },
  {
      "symbol": "NXI^D",
      "name": "Nuveen Ohio Dividend Advantage Municipal Fund"
  },
  {
      "symbol": "NXJ",
      "name": "Nuveen New Jersey Dividend Advantage Municipal Fund"
  },
  {
      "symbol": "NXJ^A",
      "name": "Nuveen New Jersey Dividend Advantage Municipal Fund"
  },
  {
      "symbol": "NXK",
      "name": "Nuveen New York Dividend Advantage Municipal Fund 2"
  },
  {
      "symbol": "NXK^C",
      "name": "Nuveen New York Dividend Advantage Municipal Fund 2"
  },
  {
      "symbol": "NXM",
      "name": "Nuveen Pennsylvania Dividend Advantage Municipal Fund"
  },
  {
      "symbol": "NXM^C",
      "name": "Nuveen Pennsylvania Dividend Advantage Municipal Fund"
  },
  {
      "symbol": "NXN",
      "name": "Nuveen Insured New York Select Tax-Free Income Portfolio"
  },
  {
      "symbol": "NXP",
      "name": "Nuveen Select Tax Free Income Portfolio"
  },
  {
      "symbol": "NXPI",
      "name": "NXP Semiconductors N.V."
  },
  {
      "symbol": "NXQ",
      "name": "Nuveen Select Tax Free Income Portfolio II"
  },
  {
      "symbol": "NXR",
      "name": "Nuveen Select Tax Free Income Portfolio III"
  },
  {
      "symbol": "NXST",
      "name": "Nexstar Broadcasting Group, Inc."
  },
  {
      "symbol": "NXTM",
      "name": "NxStage Medical, Inc."
  },
  {
      "symbol": "NXY",
      "name": "Nexen, Inc."
  },
  {
      "symbol": "NXY^B",
      "name": "Nexen, Inc."
  },
  {
      "symbol": "NXZ",
      "name": "Nuveen Dividend Advantage Municipal Fund 2"
  },
  {
      "symbol": "NYB",
      "name": "New York Community Bancorp, Inc."
  },
  {
      "symbol": "NYB^U",
      "name": "New York Community Bancorp, Inc."
  },
  {
      "symbol": "NYH",
      "name": "Eaton Vance New York Municipal Bond Fund II"
  },
  {
      "symbol": "NYMT",
      "name": "New York Mortgage Trust, Inc."
  },
  {
      "symbol": "NYMX",
      "name": "Nymox Pharmaceutical Corporation"
  },
  {
      "symbol": "NYNY",
      "name": "Empire Resorts, Inc."
  },
  {
      "symbol": "NYT",
      "name": "New York Times Company (The)"
  },
  {
      "symbol": "NYV",
      "name": "Nuveen New York Municipal Value Fund 2"
  },
  {
      "symbol": "NYX",
      "name": "NYSE Euronext, Inc."
  },
  {
      "symbol": "NZF",
      "name": "Nuveen Dividend Advantage Municipal Fund 3"
  },
  {
      "symbol": "NZF^C",
      "name": "Nuveen Dividend Advantage Municipal Fund 3"
  },
  {
      "symbol": "NZH",
      "name": "Nuveen California Dividend Advantage Municipal Fund 3"
  },
  {
      "symbol": "NZH^A",
      "name": "Nuveen California Dividend Advantage Municipal Fund 3"
  },
  {
      "symbol": "NZH^B",
      "name": "Nuveen California Dividend Advantage Municipal Fund 3"
  },
  {
      "symbol": "NZH^C",
      "name": "Nuveen California Dividend Advantage Municipal Fund 3"
  },
  {
      "symbol": "NZR",
      "name": "Nuveen Maryland Dividend Advantage Municipal Fund 2"
  },
  {
      "symbol": "NZR^C",
      "name": "Nuveen Maryland Dividend Advantage Municipal Fund 2"
  },
  {
      "symbol": "NZT",
      "name": "Telecom Corporation of New Zealand Limited"
  },
  {
      "symbol": "NZW",
      "name": "Nuveen Michigan Dividend Advantage Municipal Fund"
  },
  {
      "symbol": "NZW^C",
      "name": "Nuveen Michigan Dividend Advantage Municipal Fund"
  },
  {
      "symbol": "NZX",
      "name": "Nuveen Georgia Dividend Advantage Municipal Fund"
  },
  {
      "symbol": "NZX^C",
      "name": "Nuveen Georgia Dividend Advantage Municipal Fund"
  },
  {
      "symbol": "O",
      "name": "Realty Income Corporation"
  },
  {
      "symbol": "O^E",
      "name": "Realty Income Corporation"
  },
  {
      "symbol": "O^F",
      "name": "Realty Income Corporation"
  },
  {
      "symbol": "OABC",
      "name": "OmniAmerican Bancorp, Inc."
  },
  {
      "symbol": "OAK",
      "name": "Oaktree Capital Group, LLC"
  },
  {
      "symbol": "OAS",
      "name": "Oasis Petroleum Inc."
  },
  {
      "symbol": "OB",
      "name": "OneBeacon Insurance Group, Ltd."
  },
  {
      "symbol": "OBAF",
      "name": "OBA Financial Services, Inc."
  },
  {
      "symbol": "OBAS",
      "name": "Optibase Ltd."
  },
  {
      "symbol": "OBCI",
      "name": "Ocean Bio-Chem, Inc."
  },
  {
      "symbol": "OBT",
      "name": "Orbital Corporation Limited"
  },
  {
      "symbol": "OC",
      "name": "Owens Corning Inc"
  },
  {
      "symbol": "OC/WS/B",
      "name": "Owens Corning Inc"
  },
  {
      "symbol": "OCC",
      "name": "Optical Cable Corporation"
  },
  {
      "symbol": "OCFC",
      "name": "OceanFirst Financial Corp."
  },
  {
      "symbol": "OCLR",
      "name": "Oclaro, Inc."
  },
  {
      "symbol": "OCLS",
      "name": "Oculus Innovative Sciences, Inc."
  },
  {
      "symbol": "OCN",
      "name": "Ocwen Financial Corporation"
  },
  {
      "symbol": "OCR",
      "name": "Omnicare, Inc."
  },
  {
      "symbol": "OCR^A",
      "name": "Omnicare, Inc."
  },
  {
      "symbol": "OCR^B",
      "name": "Omnicare, Inc."
  },
  {
      "symbol": "OCZ",
      "name": "OCZ Technology Group Inc"
  },
  {
      "symbol": "ODC",
      "name": "Oil-Dri Corporation Of America"
  },
  {
      "symbol": "ODFL",
      "name": "Old Dominion Freight Line, Inc."
  },
  {
      "symbol": "ODP",
      "name": "Office Depot, Inc."
  },
  {
      "symbol": "OEH",
      "name": "Orient-Express Hotels Ltd."
  },
  {
      "symbol": "OESX",
      "name": "Orion Energy Systems, Inc."
  },
  {
      "symbol": "OFC",
      "name": "Corporate Office Properties Trust"
  },
  {
      "symbol": "OFC^G",
      "name": "Corporate Office Properties Trust"
  },
  {
      "symbol": "OFC^H",
      "name": "Corporate Office Properties Trust"
  },
  {
      "symbol": "OFC^J",
      "name": "Corporate Office Properties Trust"
  },
  {
      "symbol": "OFED",
      "name": "Oconee Federal Financial Corp."
  },
  {
      "symbol": "OFG",
      "name": "Oriental Financial Group, Inc."
  },
  {
      "symbol": "OFG^A",
      "name": "Oriental Financial Group, Inc."
  },
  {
      "symbol": "OFG^B",
      "name": "Oriental Financial Group, Inc."
  },
  {
      "symbol": "OFI",
      "name": "Overhill Farms, Inc."
  },
  {
      "symbol": "OFIX",
      "name": "Orthofix International N.V."
  },
  {
      "symbol": "OFLX",
      "name": "Omega Flex, Inc."
  },
  {
      "symbol": "OGE",
      "name": "OGE Energy Corporation"
  },
  {
      "symbol": "OGXI",
      "name": "OncoGenex Pharmaceuticals Inc."
  },
  {
      "symbol": "OHI",
      "name": "Omega Healthcare Investors, Inc."
  },
  {
      "symbol": "OI",
      "name": "Owens-Illinois, Inc."
  },
  {
      "symbol": "OIA",
      "name": "Invesco Municipal Income Opportunities Trust"
  },
  {
      "symbol": "OIB",
      "name": "Invesco Municipal Income Opportunities Trust II"
  },
  {
      "symbol": "OIBR",
      "name": "Oi S.A."
  },
  {
      "symbol": "OIBR/C",
      "name": "Oi S.A."
  },
  {
      "symbol": "OIC",
      "name": "Invesco Municipal Income Opportunities Trust III"
  },
  {
      "symbol": "OII",
      "name": "Oceaneering International, Inc."
  },
  {
      "symbol": "OIIM",
      "name": "O2Micro International Limited"
  },
  {
      "symbol": "OILT",
      "name": "Oiltanking Partners, L.P."
  },
  {
      "symbol": "OINK",
      "name": "Tianli Agritech, Inc."
  },
  {
      "symbol": "OIS",
      "name": "Oil States International, Inc."
  },
  {
      "symbol": "OKE",
      "name": "ONEOK, Inc."
  },
  {
      "symbol": "OKS",
      "name": "ONEOK Partners, L.P."
  },
  {
      "symbol": "OKSB",
      "name": "Southwest Bancorp, Inc."
  },
  {
      "symbol": "OKSBP",
      "name": "Southwest Bancorp, Inc."
  },
  {
      "symbol": "OLBK",
      "name": "Old Line Bancshares, Inc."
  },
  {
      "symbol": "OLCB",
      "name": "Ohio Legacy Corporation"
  },
  {
      "symbol": "OLN",
      "name": "Olin Corporation"
  },
  {
      "symbol": "OLP",
      "name": "One Liberty Properties, Inc."
  },
  {
      "symbol": "OMAB",
      "name": "Grupo Aeroportuario del Centro Norte S.A.B. de C.V."
  },
  {
      "symbol": "OMC",
      "name": "Omnicom Group Inc."
  },
  {
      "symbol": "OMCL",
      "name": "Omnicell, Inc."
  },
  {
      "symbol": "OME",
      "name": "Omega Protein Corporation"
  },
  {
      "symbol": "OMER",
      "name": "Omeros Corporation"
  },
  {
      "symbol": "OMEX",
      "name": "Odyssey Marine Exploration, Inc."
  },
  {
      "symbol": "OMG",
      "name": "OM Group, Inc."
  },
  {
      "symbol": "OMI",
      "name": "Owens & Minor, Inc."
  },
  {
      "symbol": "OMN",
      "name": "OMNOVA Solutions Inc."
  },
  {
      "symbol": "OMPI",
      "name": "Obagi Medical Products, Inc."
  },
  {
      "symbol": "OMX",
      "name": "Officemax Incorporated"
  },
  {
      "symbol": "ONB",
      "name": "Old National Bancorp Capital Trust I"
  },
  {
      "symbol": "ONCY",
      "name": "Oncolytics Biotech, Inc."
  },
  {
      "symbol": "ONE           ",
      "name": "Higher One Holdings, Inc."
  },
  {
      "symbol": "ONEQ",
      "name": "Fidelity Nasdaq Composite Index Tracking Stock"
  },
  {
      "symbol": "ONFC",
      "name": "Oneida Financial Corp."
  },
  {
      "symbol": "ONNN",
      "name": "ON Semiconductor Corporation"
  },
  {
      "symbol": "ONP",
      "name": "Orient Paper, Inc."
  },
  {
      "symbol": "ONSM",
      "name": "Onstream Media Corporation"
  },
  {
      "symbol": "ONTY",
      "name": "Oncothyreon Inc."
  },
  {
      "symbol": "ONVI",
      "name": "Onvia, Inc."
  },
  {
      "symbol": "ONXX",
      "name": "ONYX Pharmaceuticals, Inc."
  },
  {
      "symbol": "OOZ^K",
      "name": "SiM Internal Test 7"
  },
  {
      "symbol": "OPAY",
      "name": "Official Payments Holdings, Inc."
  },
  {
      "symbol": "OPEN",
      "name": "OpenTable, Inc."
  },
  {
      "symbol": "OPHC",
      "name": "OptimumBank Holdings, Inc."
  },
  {
      "symbol": "OPK",
      "name": "Opko Health Inc"
  },
  {
      "symbol": "OPLK",
      "name": "Oplink Communications, Inc."
  },
  {
      "symbol": "OPNT",
      "name": "OPNET Technologies Inc."
  },
  {
      "symbol": "OPOF",
      "name": "Old Point Financial Corporation"
  },
  {
      "symbol": "OPTR",
      "name": "Optimer Pharmaceuticals, Inc."
  },
  {
      "symbol": "OPTT",
      "name": "Ocean Power Technologies, Inc."
  },
  {
      "symbol": "OPWV",
      "name": "Openwave Systems Inc"
  },
  {
      "symbol": "OPXA",
      "name": "Opexa Therapeutics, Inc."
  },
  {
      "symbol": "OPXAW",
      "name": "Opexa Therapeutics, Inc."
  },
  {
      "symbol": "OPXT",
      "name": "Opnext, Inc."
  },
  {
      "symbol": "OPY",
      "name": "Oppenheimer Holdings, Inc."
  },
  {
      "symbol": "ORA",
      "name": "Ormat Technologies, Inc."
  },
  {
      "symbol": "ORB",
      "name": "Orbital Sciences Corporation"
  },
  {
      "symbol": "ORBC",
      "name": "ORBCOMM Inc."
  },
  {
      "symbol": "ORBK",
      "name": "Orbotech Ltd."
  },
  {
      "symbol": "ORBT",
      "name": "Orbit International Corporation"
  },
  {
      "symbol": "ORCC",
      "name": "Online Resources Corporation"
  },
  {
      "symbol": "ORCL",
      "name": "Oracle Corporation"
  },
  {
      "symbol": "ORCT",
      "name": "Orckit Communications, Limited"
  },
  {
      "symbol": "OREX",
      "name": "Orexigen Therapeutics, Inc."
  },
  {
      "symbol": "ORI",
      "name": "Old Republic International Corporation"
  },
  {
      "symbol": "ORIG",
      "name": "Ocean Rig UDW Inc."
  },
  {
      "symbol": "ORIT",
      "name": "Oritani Financial Corp."
  },
  {
      "symbol": "ORLY",
      "name": "O&#39;Reilly Automotive, Inc."
  },
  {
      "symbol": "ORN",
      "name": "Orion Marine Group Inc"
  },
  {
      "symbol": "ORRF",
      "name": "Orrstown Financial Services Inc"
  },
  {
      "symbol": "OSBC",
      "name": "Old Second Bancorp, Inc."
  },
  {
      "symbol": "OSBCP",
      "name": "Old Second Bancorp, Inc."
  },
  {
      "symbol": "OSG",
      "name": "Overseas Shipholding Group, Inc."
  },
  {
      "symbol": "OSH",
      "name": "Orchard Supply Hardware Stores Corporation"
  },
  {
      "symbol": "OSHC",
      "name": "Ocean Shore Holding Co."
  },
  {
      "symbol": "OSIR",
      "name": "Osiris Therapeutics, Inc."
  },
  {
      "symbol": "OSIS",
      "name": "OSI Systems, Inc."
  },
  {
      "symbol": "OSK",
      "name": "Oshkosh Truck Corporation"
  },
  {
      "symbol": "OSM",
      "name": "SLM Corporation"
  },
  {
      "symbol": "OSN",
      "name": "Ossen Innovation Co., Ltd."
  },
  {
      "symbol": "OSTK",
      "name": "Overstock.com, Inc."
  },
  {
      "symbol": "OSUR",
      "name": "OraSure Technologies, Inc."
  },
  {
      "symbol": "OTEX",
      "name": "Open Text Corporation"
  },
  {
      "symbol": "OTIV",
      "name": "On Track Innovations Ltd"
  },
  {
      "symbol": "OTT",
      "name": "Otelco, Inc."
  },
  {
      "symbol": "OTTR",
      "name": "Otter Tail Corporation"
  },
  {
      "symbol": "OUTD",
      "name": "Outdoor Channel Holdings, Inc."
  },
  {
      "symbol": "OVBC",
      "name": "Ohio Valley Banc Corp."
  },
  {
      "symbol": "OVLY",
      "name": "Oak Valley Bancorp (CA)"
  },
  {
      "symbol": "OVRL",
      "name": "Overland Storage, Inc."
  },
  {
      "symbol": "OVTI",
      "name": "OmniVision Technologies, Inc."
  },
  {
      "symbol": "OWW",
      "name": "Orbitz Worldwide, Inc."
  },
  {
      "symbol": "OXBT",
      "name": "Oxygen Biotherapeutics, Inc."
  },
  {
      "symbol": "OXF",
      "name": "Oxford Resource Partners, LP"
  },
  {
      "symbol": "OXGN",
      "name": "OXiGENE, Inc."
  },
  {
      "symbol": "OXLC",
      "name": "Oxford Lane Capital Corp."
  },
  {
      "symbol": "OXM",
      "name": "Oxford Industries, Inc."
  },
  {
      "symbol": "OXY",
      "name": "Occidental Petroleum Corporation"
  },
  {
      "symbol": "OYOG",
      "name": "OYO Geospace Corporation"
  },
  {
      "symbol": "OZM",
      "name": "Och-Ziff Capital Management Group LLC"
  },
  {
      "symbol": "OZRK",
      "name": "Bank of the Ozarks"
  },
  {
      "symbol": "P",
      "name": "Pandora Media, Inc."
  },
  {
      "symbol": "PAA",
      "name": "Plains All American Pipeline, L.P."
  },
  {
      "symbol": "PAAS",
      "name": "Pan American Silver Corp."
  },
  {
      "symbol": "PAC",
      "name": "Grupo Aeroportuario Del Pacifico, S.A. de C.V."
  },
  {
      "symbol": "PACB",
      "name": "Pacific Biosciences of California, Inc."
  },
  {
      "symbol": "PACD",
      "name": "Pacific Drilling S.A."
  },
  {
      "symbol": "PACQ",
      "name": "Prime Acquisition Corp."
  },
  {
      "symbol": "PACQU",
      "name": "Prime Acquisition Corp."
  },
  {
      "symbol": "PACQW",
      "name": "Prime Acquisition Corp."
  },
  {
      "symbol": "PACR",
      "name": "Pacer International, Inc."
  },
  {
      "symbol": "PACW",
      "name": "PacWest Bancorp"
  },
  {
      "symbol": "PAG",
      "name": "Penske Automotive Group, Inc."
  },
  {
      "symbol": "PAGG",
      "name": "PowerShares Global Agriculture Portfolio"
  },
  {
      "symbol": "PAI",
      "name": "Pacific American Income Shares, Inc."
  },
  {
      "symbol": "PAL",
      "name": "North American Palladium, Ltd."
  },
  {
      "symbol": "PAM",
      "name": "Pampa Energia S.A."
  },
  {
      "symbol": "PAMT",
      "name": "Parametric Sound Corp."
  },
  {
      "symbol": "PANL",
      "name": "Universal Display Corporation"
  },
  {
      "symbol": "PAR",
      "name": "PAR Technology Corporation"
  },
  {
      "symbol": "PATH",
      "name": "NuPathe Inc."
  },
  {
      "symbol": "PATK",
      "name": "Patrick Industries, Inc."
  },
  {
      "symbol": "PATR",
      "name": "Patriot Transportation Holding, Inc."
  },
  {
      "symbol": "PAY",
      "name": "Verifone Systems, Inc."
  },
  {
      "symbol": "PAYX",
      "name": "Paychex, Inc."
  },
  {
      "symbol": "PB",
      "name": "Prosperity Bancshares, Inc."
  },
  {
      "symbol": "PBA",
      "name": "Pembina Pipeline Corp."
  },
  {
      "symbol": "PBCT",
      "name": "People&#39;s United Financial, Inc."
  },
  {
      "symbol": "PBH",
      "name": "Prestige Brand Holdings, Inc."
  },
  {
      "symbol": "PBHC",
      "name": "Pathfinder Bancorp, Inc."
  },
  {
      "symbol": "PBI",
      "name": "Pitney Bowes Inc"
  },
  {
      "symbol": "PBI^",
      "name": "Pitney Bowes Inc"
  },
  {
      "symbol": "PBIB",
      "name": "Porter Bancorp, Inc."
  },
  {
      "symbol": "PBIP",
      "name": "Prudential Bancorp, Inc. of Pennsylvania"
  },
  {
      "symbol": "PBM",
      "name": "Pacific Booker Minerals Inc"
  },
  {
      "symbol": "PBMD",
      "name": "Prima BioMed Ltd"
  },
  {
      "symbol": "PBNY",
      "name": "Provident New York Bancorp"
  },
  {
      "symbol": "PBR",
      "name": "Petroleo Brasileiro S.A.- Petrobras"
  },
  {
      "symbol": "PBR/A",
      "name": "Petroleo Brasileiro S.A.- Petrobras"
  },
  {
      "symbol": "PBSK",
      "name": "Poage Bankshares, Inc."
  },
  {
      "symbol": "PBT",
      "name": "Permian Basin Royalty Trust"
  },
  {
      "symbol": "PBTH",
      "name": "PROLOR Biotech, Inc."
  },
  {
      "symbol": "PBY",
      "name": "Pep Boys-Manny, Moe & Jack (The)"
  },
  {
      "symbol": "PC",
      "name": "Panasonic Corporation"
  },
  {
      "symbol": "PCAR",
      "name": "PACCAR Inc."
  },
  {
      "symbol": "PCBC",
      "name": "Pacific Capital Bancorp"
  },
  {
      "symbol": "PCBK",
      "name": "Pacific Continental Corporation (Ore)"
  },
  {
      "symbol": "PCC",
      "name": "PMC Commercial Trust"
  },
  {
      "symbol": "PCCC",
      "name": "PC Connection, Inc."
  },
  {
      "symbol": "PCF",
      "name": "Putnam High Income Bond Fund"
  },
  {
      "symbol": "PCG",
      "name": "Pacific Gas & Electric Co."
  },
  {
      "symbol": "PCG^A",
      "name": "Pacific Gas & Electric Co."
  },
  {
      "symbol": "PCG^B",
      "name": "Pacific Gas & Electric Co."
  },
  {
      "symbol": "PCG^C",
      "name": "Pacific Gas & Electric Co."
  },
  {
      "symbol": "PCG^D",
      "name": "Pacific Gas & Electric Co."
  },
  {
      "symbol": "PCG^E",
      "name": "Pacific Gas & Electric Co."
  },
  {
      "symbol": "PCG^G",
      "name": "Pacific Gas & Electric Co."
  },
  {
      "symbol": "PCG^H",
      "name": "Pacific Gas & Electric Co."
  },
  {
      "symbol": "PCG^I",
      "name": "Pacific Gas & Electric Co."
  },
  {
      "symbol": "PCH",
      "name": "Potlatch Corporation"
  },
  {
      "symbol": "PCK",
      "name": "Pimco California Municipal Income Fund II"
  },
  {
      "symbol": "PCL",
      "name": "Plum Creek Timber Company, Inc."
  },
  {
      "symbol": "PCLN",
      "name": "priceline.com Incorporated"
  },
  {
      "symbol": "PCM",
      "name": "PIMCO Commercial Mortgage Securities Trust, Inc."
  },
  {
      "symbol": "PCN",
      "name": "Pimco Corporate & Income Stategy Fund"
  },
  {
      "symbol": "PCO",
      "name": "Pendrell Corporation"
  },
  {
      "symbol": "PCOM",
      "name": "Points International, Ltd."
  },
  {
      "symbol": "PCP",
      "name": "Precision Castparts Corporation"
  },
  {
      "symbol": "PCQ",
      "name": "PIMCO California Municipal Income Fund"
  },
  {
      "symbol": "PCRX",
      "name": "Pacira Pharmaceuticals, Inc."
  },
  {
      "symbol": "PCS",
      "name": "MetroPCS Communications, Inc."
  },
  {
      "symbol": "PCTI",
      "name": "PC-Tel, Inc."
  },
  {
      "symbol": "PCX",
      "name": "Patriot Coal Corporation"
  },
  {
      "symbol": "PCYC",
      "name": "Pharmacyclics, Inc."
  },
  {
      "symbol": "PCYG",
      "name": "Park City Group, Inc."
  },
  {
      "symbol": "PCYO",
      "name": "Pure Cycle Corporation"
  },
  {
      "symbol": "PDC",
      "name": "Pioneer Drilling Co"
  },
  {
      "symbol": "PDCO",
      "name": "Patterson Companies, Inc."
  },
  {
      "symbol": "PDEX",
      "name": "Pro-Dex, Inc."
  },
  {
      "symbol": "PDFS",
      "name": "PDF Solutions, Inc."
  },
  {
      "symbol": "PDII",
      "name": "PDI, Inc."
  },
  {
      "symbol": "PDLI",
      "name": "PDL BioPharma, Inc."
  },
  {
      "symbol": "PDM",
      "name": "Piedmont Office Realty Trust, Inc."
  },
  {
      "symbol": "PDO",
      "name": "Pyramid Oil Co"
  },
  {
      "symbol": "PDS",
      "name": "Precision Drilling Corporation"
  },
  {
      "symbol": "PDT",
      "name": "John Hancock Premium Dividend Fund"
  },
  {
      "symbol": "PE^A",
      "name": "Peco Energy Company"
  },
  {
      "symbol": "PE^B",
      "name": "Peco Energy Company"
  },
  {
      "symbol": "PE^C",
      "name": "Peco Energy Company"
  },
  {
      "symbol": "PE^D",
      "name": "Peco Energy Company"
  },
  {
      "symbol": "PEB",
      "name": "Pebblebrook Hotel Trust"
  },
  {
      "symbol": "PEB^A",
      "name": "Pebblebrook Hotel Trust"
  },
  {
      "symbol": "PEB^B",
      "name": "Pebblebrook Hotel Trust"
  },
  {
      "symbol": "PEBK",
      "name": "Peoples Bancorp of North Carolina, Inc."
  },
  {
      "symbol": "PEBO",
      "name": "Peoples Bancorp Inc."
  },
  {
      "symbol": "PEDH",
      "name": "Peoples Educational Holdings, Inc."
  },
  {
      "symbol": "PEET",
      "name": "Peet&#39;s Coffee & Tea, Inc."
  },
  {
      "symbol": "PEG",
      "name": "Public Service Enterprise Group Incorporated"
  },
  {
      "symbol": "PEGA",
      "name": "Pegasystems Inc."
  },
  {
      "symbol": "PEI",
      "name": "Pennsylvania Real Estate Investment Trust"
  },
  {
      "symbol": "PEI^A",
      "name": "Pennsylvania Real Estate Investment Trust"
  },
  {
      "symbol": "PEIX",
      "name": "Pacific Ethanol, Inc."
  },
  {
      "symbol": "PENN",
      "name": "Penn National Gaming, Inc."
  },
  {
      "symbol": "PENX",
      "name": "Penford Corporation"
  },
  {
      "symbol": "PEO",
      "name": "Petroleum Resources Corporation"
  },
  {
      "symbol": "PEOP",
      "name": "Peoples Federal Bancshares, Inc."
  },
  {
      "symbol": "PEP",
      "name": "Pepsico, Inc."
  },
  {
      "symbol": "PER",
      "name": "SandRidge Permian Trust"
  },
  {
      "symbol": "PERF",
      "name": "Perfumania Holdings, Inc"
  },
  {
      "symbol": "PERI",
      "name": "Perion Network Ltd"
  },
  {
      "symbol": "PERY",
      "name": "Perry Ellis International Inc."
  },
  {
      "symbol": "PESI",
      "name": "Perma-Fix Environmental Services, Inc."
  },
  {
      "symbol": "PETD",
      "name": "Petroleum Development Corporation"
  },
  {
      "symbol": "PETM",
      "name": "PetSmart, Inc"
  },
  {
      "symbol": "PETS",
      "name": "PetMed Express, Inc."
  },
  {
      "symbol": "PFBC",
      "name": "Preferred Bank"
  },
  {
      "symbol": "PFBI",
      "name": "Premier Financial Bancorp, Inc."
  },
  {
      "symbol": "PFBX",
      "name": "Peoples Financial Corporation"
  },
  {
      "symbol": "PFCB",
      "name": "P.F.Chang&#39;s China Bistro, Inc."
  },
  {
      "symbol": "PFD",
      "name": "Flaherty & Crumrine Preferred Income Fund Incorporated"
  },
  {
      "symbol": "PFE",
      "name": "Pfizer, Inc."
  },
  {
      "symbol": "PFG",
      "name": "Principal Financial Group Inc"
  },
  {
      "symbol": "PFG^B",
      "name": "Principal Financial Group Inc"
  },
  {
      "symbol": "PFH",
      "name": "CABCO Series 2004-101 Trust"
  },
  {
      "symbol": "PFIN",
      "name": "P & F Industries, Inc."
  },
  {
      "symbol": "PFK",
      "name": "Prudential Financial, Inc."
  },
  {
      "symbol": "PFL",
      "name": "PIMCO Income Strategy Fund"
  },
  {
      "symbol": "PFLT",
      "name": "PennantPark Floating Rate Capital Ltd."
  },
  {
      "symbol": "PFN",
      "name": "PIMCO Income Strategy Fund II"
  },
  {
      "symbol": "PFO",
      "name": "Flaherty & Crumrine Preferred Income Opportunity Fund Inc"
  },
  {
      "symbol": "PFPT",
      "name": "Proofpoint, Inc."
  },
  {
      "symbol": "PFS",
      "name": "Provident Financial Services, Inc"
  },
  {
      "symbol": "PFSW",
      "name": "PFSweb, Inc."
  },
  {
      "symbol": "PFX",
      "name": "Phoenix Companies, Inc. (The)"
  },
  {
      "symbol": "PG",
      "name": "Procter & Gamble Company (The)"
  },
  {
      "symbol": "PGC",
      "name": "Peapack-Gladstone Financial Corporation"
  },
  {
      "symbol": "PGH",
      "name": "Pengrowth Energy Corporation"
  },
  {
      "symbol": "PGI",
      "name": "PTEK Holdings, Inc."
  },
  {
      "symbol": "PGN",
      "name": "Progress Energy, Inc."
  },
  {
      "symbol": "PGNX",
      "name": "Progenics Pharmaceuticals Inc."
  },
  {
      "symbol": "PGP",
      "name": "Pimco Global Stocksplus & Income Fund"
  },
  {
      "symbol": "PGR",
      "name": "Progressive Corporation (The)"
  },
  {
      "symbol": "PGTI",
      "name": "PGT, Inc."
  },
  {
      "symbol": "PH",
      "name": "Parker-Hannifin Corporation"
  },
  {
      "symbol": "PHA",
      "name": "PulteGroup, Inc."
  },
  {
      "symbol": "PHD",
      "name": "Pioneer Floating Rate Trust"
  },
  {
      "symbol": "PHF",
      "name": "Pacholder High Yield Fund, Inc."
  },
  {
      "symbol": "PHG",
      "name": "Koninklijke Philips Electronics, N.V."
  },
  {
      "symbol": "PHH",
      "name": "PHH Corp"
  },
  {
      "symbol": "PHI",
      "name": "Philippine Long Distance Telephone Company"
  },
  {
      "symbol": "PHII",
      "name": "PHI, Inc."
  },
  {
      "symbol": "PHIIK",
      "name": "PHI, Inc."
  },
  {
      "symbol": "PHK",
      "name": "Pimco High Income Fund"
  },
  {
      "symbol": "PHM",
      "name": "PulteGroup, Inc."
  },
  {
      "symbol": "PHMD",
      "name": "PhotoMedex, Inc."
  },
  {
      "symbol": "PHR",
      "name": "Prudential Financial, Inc."
  },
  {
      "symbol": "PHT",
      "name": "Pioneer High Income Trust"
  },
  {
      "symbol": "PHX",
      "name": "Panhandle Royalty Company"
  },
  {
      "symbol": "PIA",
      "name": "Invesco Municipal Premium Income Trust"
  },
  {
      "symbol": "PICO",
      "name": "PICO Holdings Inc."
  },
  {
      "symbol": "PII",
      "name": "Polaris Industries Inc."
  },
  {
      "symbol": "PIJ",
      "name": "Merrill Lynch Depositor, Inc."
  },
  {
      "symbol": "PIKE",
      "name": "Pike Electric Corp."
  },
  {
      "symbol": "PIM",
      "name": "Putnam Master Intermediate Income Trust"
  },
  {
      "symbol": "PIP",
      "name": "PharmAthene, Inc"
  },
  {
      "symbol": "PIR",
      "name": "Pier 1 Imports, Inc."
  },
  {
      "symbol": "PIS",
      "name": "Merrill Lynch Depositor, Inc."
  },
  {
      "symbol": "PIY",
      "name": "Merrill Lynch Depositor, Inc."
  },
  {
      "symbol": "PJA",
      "name": "Preferred Plus Trust Ser QWS 2 Tr Ctf"
  },
  {
      "symbol": "PJC",
      "name": "Piper Jaffray Companies"
  },
  {
      "symbol": "PJI",
      "name": "PPlus Trust"
  },
  {
      "symbol": "PJL",
      "name": "Preferred Plus Trust Ser QWS 2 Tr Ctf"
  },
  {
      "symbol": "PJR",
      "name": "Merrill Lynch Depositor, Inc."
  },
  {
      "symbol": "PJS",
      "name": "Preferred Plus Trust Ser QWS 2 Tr Ctf"
  },
  {
      "symbol": "PKBK",
      "name": "Parke Bancorp, Inc."
  },
  {
      "symbol": "PKD",
      "name": "Parker Drilling Company"
  },
  {
      "symbol": "PKE",
      "name": "Park Electrochemical Corporation"
  },
  {
      "symbol": "PKG",
      "name": "Packaging Corporation of America"
  },
  {
      "symbol": "PKH",
      "name": "Merrill Lynch Depositor, Inc."
  },
  {
      "symbol": "PKI",
      "name": "PerkinElmer, Inc."
  },
  {
      "symbol": "PKJ",
      "name": "Merrill Lynch Depositor, Inc."
  },
  {
      "symbol": "PKK",
      "name": "Merrill Lynch Depositor, Inc."
  },
  {
      "symbol": "PKO",
      "name": "Pimco Income Opportunity Fund"
  },
  {
      "symbol": "PKOH",
      "name": "Park-Ohio Holdings Corp."
  },
  {
      "symbol": "PKOL",
      "name": "PowerShares Global Coal Portfolio"
  },
  {
      "symbol": "PKT",
      "name": "Procera Networks, Inc."
  },
  {
      "symbol": "PKX",
      "name": "POSCO"
  },
  {
      "symbol": "PKY",
      "name": "Parkway Properties, Inc."
  },
  {
      "symbol": "PKY^D",
      "name": "Parkway Properties, Inc."
  },
  {
      "symbol": "PL",
      "name": "Protective Life Corporation"
  },
  {
      "symbol": "PL^A",
      "name": "Protective Life Corporation"
  },
  {
      "symbol": "PL^B",
      "name": "Protective Life Corporation"
  },
  {
      "symbol": "PL^D",
      "name": "Protective Life Corporation"
  },
  {
      "symbol": "PL^S",
      "name": "Protective Life Corporation"
  },
  {
      "symbol": "PLAB",
      "name": "Photronics, Inc."
  },
  {
      "symbol": "PLBC",
      "name": "Plumas Bancorp"
  },
  {
      "symbol": "PLCC",
      "name": "Paulson Capital Corp."
  },
  {
      "symbol": "PLCE",
      "name": "The Children&#39;s Place Retail Stores, Inc."
  },
  {
      "symbol": "PLCM",
      "name": "Polycom, Inc."
  },
  {
      "symbol": "PLD",
      "name": "AMB Property Corporation"
  },
  {
      "symbol": "PLD^L",
      "name": "AMB Property Corporation"
  },
  {
      "symbol": "PLD^M",
      "name": "AMB Property Corporation"
  },
  {
      "symbol": "PLD^O",
      "name": "AMB Property Corporation"
  },
  {
      "symbol": "PLD^P",
      "name": "AMB Property Corporation"
  },
  {
      "symbol": "PLD^R",
      "name": "AMB Property Corporation"
  },
  {
      "symbol": "PLD^S",
      "name": "AMB Property Corporation"
  },
  {
      "symbol": "PLFE",
      "name": "Presidential Life Corporation"
  },
  {
      "symbol": "PLG",
      "name": "Platinum Group Metals Ltd."
  },
  {
      "symbol": "PLL",
      "name": "Pall Corporation"
  },
  {
      "symbol": "PLM",
      "name": "Polymet Mining Corp."
  },
  {
      "symbol": "PLMT",
      "name": "Palmetto Bancshares, Inc. (SC)"
  },
  {
      "symbol": "PLNR",
      "name": "Planar Systems, Inc."
  },
  {
      "symbol": "PLOW",
      "name": "Douglas Dynamics, Inc."
  },
  {
      "symbol": "PLP",
      "name": "Protective Life Corporation"
  },
  {
      "symbol": "PLPC",
      "name": "Preformed Line Products Company"
  },
  {
      "symbol": "PLT",
      "name": "Plantronics, Inc."
  },
  {
      "symbol": "PLTM",
      "name": "First Trust Exchange-Traded Fund II First Trust ISE Global Pla"
  },
  {
      "symbol": "PLUG",
      "name": "Plug Power, Inc."
  },
  {
      "symbol": "PLUS",
      "name": "Eplus Inc."
  },
  {
      "symbol": "PLV",
      "name": "PPL Corporation"
  },
  {
      "symbol": "PLX",
      "name": "Protalix BioTherapeutics, Inc."
  },
  {
      "symbol": "PLXS",
      "name": "Plexus Corp."
  },
  {
      "symbol": "PLXT",
      "name": "PLX Technology, Inc."
  },
  {
      "symbol": "PM",
      "name": "Philip Morris International Inc"
  },
  {
      "symbol": "PMBC",
      "name": "Pacific Mercantile Bancorp"
  },
  {
      "symbol": "PMC",
      "name": "Pharmerica Corporation"
  },
  {
      "symbol": "PMCS",
      "name": "PMC - Sierra, Inc."
  },
  {
      "symbol": "PMD",
      "name": "Psychemedics Corporation"
  },
  {
      "symbol": "PMF",
      "name": "PIMCO Municipal Income Fund"
  },
  {
      "symbol": "PMFG",
      "name": "PMFG, Inc."
  },
  {
      "symbol": "PML",
      "name": "Pimco Municipal Income Fund II"
  },
  {
      "symbol": "PMM",
      "name": "Putnam Managed Municipal Income Trust"
  },
  {
      "symbol": "PMNA",
      "name": "PowerShares MENA Frontier Countries Portfolio"
  },
  {
      "symbol": "PMO",
      "name": "Putnam Municipal Opportunities Trust"
  },
  {
      "symbol": "PMT",
      "name": "PennyMac Mortgage Investment Trust"
  },
  {
      "symbol": "PMTC",
      "name": "Parametric Technology Corporation"
  },
  {
      "symbol": "PMTI",
      "name": "Palomar Medical Technologies, Inc."
  },
  {
      "symbol": "PMX",
      "name": "PIMCO Municipal Income Fund III"
  },
  {
      "symbol": "PNBC",
      "name": "Princeton National Bancorp, Inc."
  },
  {
      "symbol": "PNBK",
      "name": "Patriot National Bancorp Inc."
  },
  {
      "symbol": "PNC",
      "name": "PNC Financial Services Group, Inc. (The)"
  },
  {
      "symbol": "PNC/WS",
      "name": "PNC Financial Services Group, Inc. (The)"
  },
  {
      "symbol": "PNC^L",
      "name": "PNC Financial Services Group, Inc. (The)"
  },
  {
      "symbol": "PNC^P",
      "name": "PNC Financial Services Group, Inc. (The)"
  },
  {
      "symbol": "PNF",
      "name": "PIMCO New York Municipal Income Fund"
  },
  {
      "symbol": "PNFP",
      "name": "Pinnacle Financial Partners, Inc."
  },
  {
      "symbol": "PNG",
      "name": "PAA Natural Gas Storage, L.P."
  },
  {
      "symbol": "PNH",
      "name": "PNC Cap Tr E"
  },
  {
      "symbol": "PNI",
      "name": "Pimco New York Municipal Income Fund II"
  },
  {
      "symbol": "PNK",
      "name": "Pinnacle Entertainment, Inc."
  },
  {
      "symbol": "PNM",
      "name": "PNM Resources, Inc. (Holding Co.)"
  },
  {
      "symbol": "PNNT",
      "name": "PennantPark Investment Corporation"
  },
  {
      "symbol": "PNQI",
      "name": "PowerShares NASDAQ Internet Portfolio"
  },
  {
      "symbol": "PNR",
      "name": "Pentair, Inc."
  },
  {
      "symbol": "PNRA",
      "name": "Panera Bread Company"
  },
  {
      "symbol": "PNRG",
      "name": "PrimeEnergy Corporation"
  },
  {
      "symbol": "PNSN",
      "name": "Penson Worldwide, Inc."
  },
  {
      "symbol": "PNTR",
      "name": "Pointer Telocation Ltd."
  },
  {
      "symbol": "PNW",
      "name": "Pinnacle West Capital Corporation"
  },
  {
      "symbol": "PNX",
      "name": "Phoenix Companies, Inc. (The)"
  },
  {
      "symbol": "PNY",
      "name": "Piedmont Natural Gas Company, Inc."
  },
  {
      "symbol": "PODD",
      "name": "Insulet Corporation"
  },
  {
      "symbol": "POL",
      "name": "PolyOne Corporation"
  },
  {
      "symbol": "POM",
      "name": "Potomac Electric Power Company"
  },
  {
      "symbol": "POOL",
      "name": "Pool Corporation"
  },
  {
      "symbol": "POPE",
      "name": "Pope Resources"
  },
  {
      "symbol": "POR",
      "name": "Portland General Electric Company"
  },
  {
      "symbol": "POST",
      "name": "Post Holdings, Inc."
  },
  {
      "symbol": "POT",
      "name": "Potash Corporation of Saskatchewan Inc."
  },
  {
      "symbol": "POWI",
      "name": "Power Integrations, Inc."
  },
  {
      "symbol": "POWL",
      "name": "Powell Industries, Inc."
  },
  {
      "symbol": "POWR",
      "name": "PowerSecure International, Inc"
  },
  {
      "symbol": "POZN",
      "name": "Pozen, Inc."
  },
  {
      "symbol": "PPBI",
      "name": "Pacific Premier Bancorp Inc"
  },
  {
      "symbol": "PPC",
      "name": "Pilgrim&#39;s Pride Corporation"
  },
  {
      "symbol": "PPG",
      "name": "PPG Industries, Inc."
  },
  {
      "symbol": "PPHM",
      "name": "Peregrine Pharmaceuticals Inc."
  },
  {
      "symbol": "PPL",
      "name": "PPL Corporation"
  },
  {
      "symbol": "PPL^U",
      "name": "PPL Corporation"
  },
  {
      "symbol": "PPL^W",
      "name": "PPL Corporation"
  },
  {
      "symbol": "PPO",
      "name": "Polypore International Inc"
  },
  {
      "symbol": "PPP",
      "name": "Primero Mining Corp"
  },
  {
      "symbol": "PPR",
      "name": "ING Prime Rate Trust"
  },
  {
      "symbol": "PPS",
      "name": "Post Properties, Inc."
  },
  {
      "symbol": "PPS^A",
      "name": "Post Properties, Inc."
  },
  {
      "symbol": "PPT",
      "name": "Putnam Premier Income Trust"
  },
  {
      "symbol": "PPW^",
      "name": "PacifiCorp"
  },
  {
      "symbol": "PQ",
      "name": "Petroquest Energy Inc"
  },
  {
      "symbol": "PRA",
      "name": "ProAssurance Corporation"
  },
  {
      "symbol": "PRAA",
      "name": "Portfolio Recovery Associates, Inc."
  },
  {
      "symbol": "PRAN",
      "name": "Prana Biotechnology Ltd"
  },
  {
      "symbol": "PRCP",
      "name": "Perceptron, Inc."
  },
  {
      "symbol": "PRE",
      "name": "PartnerRe Ltd."
  },
  {
      "symbol": "PRE^C",
      "name": "PartnerRe Ltd."
  },
  {
      "symbol": "PRE^D",
      "name": "PartnerRe Ltd."
  },
  {
      "symbol": "PRE^E",
      "name": "PartnerRe Ltd."
  },
  {
      "symbol": "PRFT",
      "name": "Perficient, Inc."
  },
  {
      "symbol": "PRFZ",
      "name": "PowerShares FTSE RAFI US 1500 Small-Mid Portfolio"
  },
  {
      "symbol": "PRGN",
      "name": "Paragon Shipping Inc."
  },
  {
      "symbol": "PRGO",
      "name": "Perrigo Company"
  },
  {
      "symbol": "PRGS",
      "name": "Progress Software Corporation"
  },
  {
      "symbol": "PRGX",
      "name": "PRGX Global, Inc."
  },
  {
      "symbol": "PRI",
      "name": "Primerica, Inc."
  },
  {
      "symbol": "PRIM",
      "name": "Primoris Services Corporation"
  },
  {
      "symbol": "PRIS",
      "name": "Promotora De Informaciones SA"
  },
  {
      "symbol": "PRIS/B",
      "name": "Promotora De Informaciones SA"
  },
  {
      "symbol": "PRK",
      "name": "Park National Corporation"
  },
  {
      "symbol": "PRKR",
      "name": "ParkerVision, Inc."
  },
  {
      "symbol": "PRLB",
      "name": "Proto Labs, Inc."
  },
  {
      "symbol": "PRLS",
      "name": "Peerless Systems Corporation"
  },
  {
      "symbol": "PRMW",
      "name": "Primo Water Corporation"
  },
  {
      "symbol": "PRO",
      "name": "PROS Holdings, Inc."
  },
  {
      "symbol": "PROJ",
      "name": "Deltek, Inc."
  },
  {
      "symbol": "PROV",
      "name": "Provident Financial Holdings, Inc."
  },
  {
      "symbol": "PRPH",
      "name": "ProPhase Labs, Inc."
  },
  {
      "symbol": "PRSC",
      "name": "The Providence Service Corporation"
  },
  {
      "symbol": "PRSS",
      "name": "CafePress Inc."
  },
  {
      "symbol": "PRST",
      "name": "Presstek, Inc."
  },
  {
      "symbol": "PRTS",
      "name": "U.S. Auto Parts Network, Inc."
  },
  {
      "symbol": "PRU",
      "name": "Prudential Financial, Inc."
  },
  {
      "symbol": "PRWT",
      "name": "Premier West Bancorp"
  },
  {
      "symbol": "PRX",
      "name": "Pharmaceutical Resources, Inc."
  },
  {
      "symbol": "PRXI",
      "name": "Premier Exhibitions, Inc."
  },
  {
      "symbol": "PRXL",
      "name": "PAREXEL International Corporation"
  },
  {
      "symbol": "PSA",
      "name": "Public Storage"
  },
  {
      "symbol": "PSA^A",
      "name": "Public Storage"
  },
  {
      "symbol": "PSA^C",
      "name": "Public Storage"
  },
  {
      "symbol": "PSA^D",
      "name": "Public Storage"
  },
  {
      "symbol": "PSA^F",
      "name": "Public Storage"
  },
  {
      "symbol": "PSA^O",
      "name": "Public Storage"
  },
  {
      "symbol": "PSA^P",
      "name": "Public Storage"
  },
  {
      "symbol": "PSA^Q",
      "name": "Public Storage"
  },
  {
      "symbol": "PSA^R",
      "name": "Public Storage"
  },
  {
      "symbol": "PSA^S",
      "name": "Public Storage"
  },
  {
      "symbol": "PSA^T",
      "name": "Public Storage"
  },
  {
      "symbol": "PSA^W",
      "name": "Public Storage"
  },
  {
      "symbol": "PSA^X",
      "name": "Public Storage"
  },
  {
      "symbol": "PSA^Z",
      "name": "Public Storage"
  },
  {
      "symbol": "PSAU",
      "name": "PowerShares Global Gold & Precious Metals Portfolio"
  },
  {
      "symbol": "PSB",
      "name": "PS Business Parks, Inc."
  },
  {
      "symbol": "PSB^H",
      "name": "PS Business Parks, Inc."
  },
  {
      "symbol": "PSB^I",
      "name": "PS Business Parks, Inc."
  },
  {
      "symbol": "PSB^P",
      "name": "PS Business Parks, Inc."
  },
  {
      "symbol": "PSB^R",
      "name": "PS Business Parks, Inc."
  },
  {
      "symbol": "PSB^S",
      "name": "PS Business Parks, Inc."
  },
  {
      "symbol": "PSBH",
      "name": "PSB Holdings, Inc."
  },
  {
      "symbol": "PSCC",
      "name": "PowerShares Exchange-Traded Fund Trust II PowerShares S&P Smal"
  },
  {
      "symbol": "PSCD",
      "name": "PowerShares Exchange-Traded Fund Trust II PowerShares S&P Smal"
  },
  {
      "symbol": "PSCE",
      "name": "PowerShares Exchange-Traded Fund Trust II PowerShares S&P Smal"
  },
  {
      "symbol": "PSCF",
      "name": "PowerShares Exchange-Traded Fund Trust II PowerShares S&P Smal"
  },
  {
      "symbol": "PSCH",
      "name": "PowerShares Exchange-Traded Fund Trust II PowerShares S&P Smal"
  },
  {
      "symbol": "PSCI",
      "name": "PowerShares Exchange-Traded Fund Trust II PowerShares S&P Smal"
  },
  {
      "symbol": "PSCM",
      "name": "PowerShares Exchange-Traded Fund Trust II PowerShares S&P Smal"
  },
  {
      "symbol": "PSCT",
      "name": "PowerShares Exchange-Traded Fund Trust II PowerShares S&P Smal"
  },
  {
      "symbol": "PSCU",
      "name": "PowerShares Exchange-Traded Fund Trust II PowerShares S&P Smal"
  },
  {
      "symbol": "PSDV",
      "name": "pSivida Corp."
  },
  {
      "symbol": "PSE",
      "name": "Pioneer Southwest Energy Partners L.P."
  },
  {
      "symbol": "PSEC",
      "name": "Prospect Capital Corporation"
  },
  {
      "symbol": "PSEM",
      "name": "Pericom Semiconductor Corporation"
  },
  {
      "symbol": "PSF",
      "name": "Cohen & Steers Select Preferred and Income Fund, Inc."
  },
  {
      "symbol": "PSMT",
      "name": "PriceSmart, Inc."
  },
  {
      "symbol": "PSO",
      "name": "Pearson, Plc"
  },
  {
      "symbol": "PSOF",
      "name": "Pansoft Company Limited"
  },
  {
      "symbol": "PSS",
      "name": "Collective Brands, Inc."
  },
  {
      "symbol": "PSSI",
      "name": "PSS World Medical Inc."
  },
  {
      "symbol": "PSTB",
      "name": "Park Sterling Bank"
  },
  {
      "symbol": "PSTI",
      "name": "Pluristem Therapeutics, Inc."
  },
  {
      "symbol": "PSTL",
      "name": "PowerShares Global Steel Portfolio"
  },
  {
      "symbol": "PSTR",
      "name": "PostRock Energy Corporation"
  },
  {
      "symbol": "PSUN",
      "name": "Pacific Sunwear of California, Inc."
  },
  {
      "symbol": "PSW",
      "name": "Blackrock Preferred and Corporate Income Strategies Fund Inc"
  },
  {
      "symbol": "PSX",
      "name": "Phillips 66"
  },
  {
      "symbol": "PSY",
      "name": "BlackRock Credit Allocation Income Trust I, Inc"
  },
  {
      "symbol": "PT",
      "name": "Portugal Telecom SGPS, S.A ."
  },
  {
      "symbol": "PTEK",
      "name": "PokerTek, Inc."
  },
  {
      "symbol": "PTEN",
      "name": "Patterson-UTI Energy, Inc."
  },
  {
      "symbol": "PTGI",
      "name": "Primus Telecommunications Group Inc."
  },
  {
      "symbol": "PTI",
      "name": "Patni Computer Systems Limited"
  },
  {
      "symbol": "PTIE",
      "name": "Pain Therapeutics"
  },
  {
      "symbol": "PTIX",
      "name": "Performance Technologies, Incorporated"
  },
  {
      "symbol": "PTN",
      "name": "Palatin Technologies, Inc."
  },
  {
      "symbol": "PTNR",
      "name": "Partner Communications Company Ltd."
  },
  {
      "symbol": "PTNT",
      "name": "Internet Patents Corporation"
  },
  {
      "symbol": "PTP",
      "name": "Platinum Underwriters Holdings, Ltd"
  },
  {
      "symbol": "PTR",
      "name": "PetroChina Company Limited"
  },
  {
      "symbol": "PTRY",
      "name": "The Pantry, Inc."
  },
  {
      "symbol": "PTSI",
      "name": "P.A.M. Transportation Services, Inc."
  },
  {
      "symbol": "PTSX",
      "name": "Point.360"
  },
  {
      "symbol": "PTX",
      "name": "Pernix Therapeutics Holdings, Inc."
  },
  {
      "symbol": "PTY",
      "name": "Pimco Corporate & Income Opportunity Fund"
  },
  {
      "symbol": "PUK",
      "name": "Prudential Public Limited Company"
  },
  {
      "symbol": "PUK^",
      "name": "Prudential Public Limited Company"
  },
  {
      "symbol": "PUK^A",
      "name": "Prudential Public Limited Company"
  },
  {
      "symbol": "PULB",
      "name": "Pulaski Financial Corp."
  },
  {
      "symbol": "PULS",
      "name": "Pulse Electronics Corporation"
  },
  {
      "symbol": "PURE",
      "name": "PURE Bioscience, Inc."
  },
  {
      "symbol": "PVA",
      "name": "Penn Virginia Corporation"
  },
  {
      "symbol": "PVD",
      "name": "Administradora de Fondos de Pensiones-Provida, S.A."
  },
  {
      "symbol": "PVFC",
      "name": "PVF Capital Corp."
  },
  {
      "symbol": "PVG",
      "name": "Pretium Resources, Inc."
  },
  {
      "symbol": "PVH",
      "name": "PVH Corp."
  },
  {
      "symbol": "PVR",
      "name": "Penn Virginia Resource Partners LP"
  },
  {
      "symbol": "PVSW",
      "name": "Pervasive Software Inc."
  },
  {
      "symbol": "PVTB",
      "name": "PrivateBancorp, Inc."
  },
  {
      "symbol": "PVTBP",
      "name": "PrivateBancorp, Inc."
  },
  {
      "symbol": "PW",
      "name": "Power REIT"
  },
  {
      "symbol": "PWAV",
      "name": "Powerwave Technologies, Inc."
  },
  {
      "symbol": "PWE",
      "name": "Penn West Petroleum Ltd"
  },
  {
      "symbol": "PWER",
      "name": "Power-One, Inc."
  },
  {
      "symbol": "PWND",
      "name": "PowerShares Global Wind Energy Portfolio"
  },
  {
      "symbol": "PWOD",
      "name": "Penns Woods Bancorp, Inc."
  },
  {
      "symbol": "PWR",
      "name": "Quanta Services, Inc."
  },
  {
      "symbol": "PWRD",
      "name": "Perfect World Co., Ltd."
  },
  {
      "symbol": "PWX",
      "name": "Providence and Worcester Railroad Company"
  },
  {
      "symbol": "PX",
      "name": "Praxair, Inc."
  },
  {
      "symbol": "PXD",
      "name": "Pioneer Natural Resources Company"
  },
  {
      "symbol": "PXLW",
      "name": "Pixelworks, Inc."
  },
  {
      "symbol": "PXP",
      "name": "Plains Exploration & Production Company"
  },
  {
      "symbol": "PYA",
      "name": "PPlus Trust"
  },
  {
      "symbol": "PYB",
      "name": "PPlus Trust"
  },
  {
      "symbol": "PYC",
      "name": "PPlus Trust"
  },
  {
      "symbol": "PYG",
      "name": "PPlus Trust"
  },
  {
      "symbol": "PYJ",
      "name": "PPlus Trust"
  },
  {
      "symbol": "PYK",
      "name": "PPlus Trust"
  },
  {
      "symbol": "PYL",
      "name": "PPlus Trust"
  },
  {
      "symbol": "PYN",
      "name": "PIMCO New York Municipal Income Fund III"
  },
  {
      "symbol": "PYS",
      "name": "PPlus Trust"
  },
  {
      "symbol": "PYT",
      "name": "PPlus Trust"
  },
  {
      "symbol": "PYV",
      "name": "PPlus Trust"
  },
  {
      "symbol": "PYY",
      "name": "Merrill Lynch Depositor, Inc."
  },
  {
      "symbol": "PZB",
      "name": "Merrill Lynch Depositor, Inc."
  },
  {
      "symbol": "PZC",
      "name": "PIMCO California Municipal Income Fund III"
  },
  {
      "symbol": "PZE",
      "name": "Petrobras Argentina S.A."
  },
  {
      "symbol": "PZG",
      "name": "Paramount Gold and Silver Corp."
  },
  {
      "symbol": "PZN",
      "name": "Pzena Investment Management Inc"
  },
  {
      "symbol": "PZZA",
      "name": "Papa John&#39;S International, Inc."
  },
  {
      "symbol": "PZZI",
      "name": "Pizza Inn Holdings, Inc."
  },
  {
      "symbol": "QABA",
      "name": "First Trust NASDAQ ABA Community Bank Index Fund"
  },
  {
      "symbol": "QADA",
      "name": "QAD Inc."
  },
  {
      "symbol": "QADB",
      "name": "QAD Inc."
  },
  {
      "symbol": "QBAK",
      "name": "Qualstar Corporation"
  },
  {
      "symbol": "QBC",
      "name": "Cubic Energy Inc"
  },
  {
      "symbol": "QCCO",
      "name": "QC Holdings, Inc."
  },
  {
      "symbol": "QCLN",
      "name": "First Trust NASDAQ Clean Edge U.S. Liquid Series Index Fund"
  },
  {
      "symbol": "QCOM",
      "name": "QUALCOMM Incorporated"
  },
  {
      "symbol": "QCOR",
      "name": "Questcor Pharmaceuticals, Inc."
  },
  {
      "symbol": "QCRH",
      "name": "QCR Holdings, Inc."
  },
  {
      "symbol": "QDEL",
      "name": "Quidel Corporation"
  },
  {
      "symbol": "QEP",
      "name": "QEP Resources, Inc."
  },
  {
      "symbol": "QGEN",
      "name": "Qiagen N.V."
  },
  {
      "symbol": "QIHU",
      "name": "Qihoo 360 Technology Co. Ltd."
  },
  {
      "symbol": "QKLS",
      "name": "QKL Stores, Inc."
  },
  {
      "symbol": "QLGC",
      "name": "QLogic Corporation"
  },
  {
      "symbol": "QLIK",
      "name": "Qlik Technologies Inc."
  },
  {
      "symbol": "QLTI",
      "name": "QLT Inc."
  },
  {
      "symbol": "QLTY",
      "name": "Quality Distribution, Inc."
  },
  {
      "symbol": "QMM",
      "name": "Quaterra Resources Inc"
  },
  {
      "symbol": "QNST",
      "name": "QuinStreet, Inc."
  },
  {
      "symbol": "QPSA",
      "name": "Quepasa Corporation"
  },
  {
      "symbol": "QQEW",
      "name": "First Trust NASDAQ-100 Equal Weighted Index Fund"
  },
  {
      "symbol": "QQQ",
      "name": "PowerShares QQQ Trust, Series 1"
  },
  {
      "symbol": "QQQC",
      "name": "Global X NASDAQ China Technology ETF"
  },
  {
      "symbol": "QQQM",
      "name": "Global X Funds Global X NASDAQ 400 Mid Cap ETF"
  },
  {
      "symbol": "QQQV",
      "name": "Global X Funds Global X NASDAQ 500 ETF"
  },
  {
      "symbol": "QQQX",
      "name": "NASDAQ Premium Income and Growth Fund Inc."
  },
  {
      "symbol": "QQXT",
      "name": "First Trust NASDAQ-100 Ex-Technology Sector Index Fund"
  },
  {
      "symbol": "QQZ^K",
      "name": "SiM Internal Test 8"
  },
  {
      "symbol": "QRE",
      "name": "QR Energy, LP"
  },
  {
      "symbol": "QRM",
      "name": "Quest Rare Minerals Ltd"
  },
  {
      "symbol": "QSFT",
      "name": "Quest Software, Inc."
  },
  {
      "symbol": "QSII",
      "name": "Quality Systems, Inc."
  },
  {
      "symbol": "QTEC",
      "name": "First Trust NASDAQ-100-Technology Sector Index Fund"
  },
  {
      "symbol": "QTM",
      "name": "Quantum Corporation"
  },
  {
      "symbol": "QTWW",
      "name": "Quantum Fuel Systems Technologies Worldwide, Inc."
  },
  {
      "symbol": "QUAD",
      "name": "Quad Graphics, Inc"
  },
  {
      "symbol": "QUIK",
      "name": "QuickLogic Corporation"
  },
  {
      "symbol": "QXM",
      "name": "Qiao Xing Mobile Communication Co., Ltd."
  },
  {
      "symbol": "R",
      "name": "Ryder System, Inc."
  },
  {
      "symbol": "RA",
      "name": "RailAmerica, Inc."
  },
  {
      "symbol": "RAD",
      "name": "Rite Aid Corporation"
  },
  {
      "symbol": "RADA",
      "name": "Rada Electronics Industries Limited"
  },
  {
      "symbol": "RAH",
      "name": "Ralcorp Holdings, Inc."
  },
  {
      "symbol": "RAI",
      "name": "Reynolds American Inc"
  },
  {
      "symbol": "RAIL",
      "name": "Freightcar America, Inc."
  },
  {
      "symbol": "RAND",
      "name": "Rand Capital Corporation"
  },
  {
      "symbol": "RAS",
      "name": "RAIT Financial Trust"
  },
  {
      "symbol": "RAS^A",
      "name": "RAIT Financial Trust"
  },
  {
      "symbol": "RAS^B",
      "name": "RAIT Financial Trust"
  },
  {
      "symbol": "RAS^C",
      "name": "RAIT Financial Trust"
  },
  {
      "symbol": "RATE",
      "name": "Bankrate, Inc."
  },
  {
      "symbol": "RAVN",
      "name": "Raven Industries, Inc."
  },
  {
      "symbol": "RAX",
      "name": "Rackspace Hosting, Inc"
  },
  {
      "symbol": "RBA",
      "name": "Ritchie Bros. Auctioneers Incorporated"
  },
  {
      "symbol": "RBC",
      "name": "Regal Beloit Corporation"
  },
  {
      "symbol": "RBCAA",
      "name": "Republic Bancorp, Inc."
  },
  {
      "symbol": "RBCN",
      "name": "Rubicon Technology, Inc."
  },
  {
      "symbol": "RBN",
      "name": "Robbins & Myers, Inc."
  },
  {
      "symbol": "RBNF",
      "name": "Rurban Financial Corp"
  },
  {
      "symbol": "RBPAA",
      "name": "Royal Bancshares of Pennsylvania, Inc."
  },
  {
      "symbol": "RBS",
      "name": "Royal Bank Scotland Group Plc"
  },
  {
      "symbol": "RBS^E",
      "name": "Royal Bank Scotland Group Plc"
  },
  {
      "symbol": "RBS^F",
      "name": "Royal Bank Scotland Group Plc"
  },
  {
      "symbol": "RBS^G",
      "name": "Royal Bank Scotland Group Plc"
  },
  {
      "symbol": "RBS^H",
      "name": "Royal Bank Scotland Group Plc"
  },
  {
      "symbol": "RBS^I",
      "name": "Royal Bank Scotland Group Plc"
  },
  {
      "symbol": "RBS^L",
      "name": "Royal Bank Scotland Group Plc"
  },
  {
      "symbol": "RBS^M",
      "name": "Royal Bank Scotland Group Plc"
  },
  {
      "symbol": "RBS^N",
      "name": "Royal Bank Scotland Group Plc"
  },
  {
      "symbol": "RBS^P",
      "name": "Royal Bank Scotland Group Plc"
  },
  {
      "symbol": "RBS^Q",
      "name": "Royal Bank Scotland Group Plc"
  },
  {
      "symbol": "RBS^R",
      "name": "Royal Bank Scotland Group Plc"
  },
  {
      "symbol": "RBS^S",
      "name": "Royal Bank Scotland Group Plc"
  },
  {
      "symbol": "RBS^T",
      "name": "Royal Bank Scotland Group Plc"
  },
  {
      "symbol": "RBY",
      "name": "Rubicon Minerals Corp"
  },
  {
      "symbol": "RC",
      "name": "Grupo Radio Centro, S.A. de C.V."
  },
  {
      "symbol": "RCG",
      "name": "Renaissance Capital Growth & Income Fund III, Inc."
  },
  {
      "symbol": "RCI",
      "name": "Rogers Communication, Inc."
  },
  {
      "symbol": "RCII",
      "name": "Rent-A-Center Inc."
  },
  {
      "symbol": "RCKB",
      "name": "Rockville Financial, Inc."
  },
  {
      "symbol": "RCKY",
      "name": "Rocky Brands, Inc."
  },
  {
      "symbol": "RCL",
      "name": "Royal Caribbean Cruises Ltd."
  },
  {
      "symbol": "RCMT",
      "name": "RCM Technologies, Inc."
  },
  {
      "symbol": "RCON",
      "name": "Recon Technology, Ltd."
  },
  {
      "symbol": "RCS",
      "name": "RCM Strategic Global Government Fund, Inc."
  },
  {
      "symbol": "RDA",
      "name": "RDA Microelectronics, Inc."
  },
  {
      "symbol": "RDC",
      "name": "Rowan Companies plc"
  },
  {
      "symbol": "RDCM",
      "name": "Radcom Ltd."
  },
  {
      "symbol": "RDEA",
      "name": "Ardea Biosciences, Inc."
  },
  {
      "symbol": "RDEN",
      "name": "Elizabeth Arden, Inc."
  },
  {
      "symbol": "RDI",
      "name": "Reading International Inc"
  },
  {
      "symbol": "RDIB",
      "name": "Reading International Inc"
  },
  {
      "symbol": "RDN",
      "name": "Radian Group Inc."
  },
  {
      "symbol": "RDNT",
      "name": "RadNet, Inc."
  },
  {
      "symbol": "RDS/A",
      "name": "Royal Dutch Shell PLC"
  },
  {
      "symbol": "RDS/B",
      "name": "Royal Dutch Shell PLC"
  },
  {
      "symbol": "RDWR",
      "name": "Radware Ltd."
  },
  {
      "symbol": "RDY",
      "name": "Dr. Reddy&#39;s Laboratories Ltd"
  },
  {
      "symbol": "RE",
      "name": "Everest Re Group, Ltd."
  },
  {
      "symbol": "RE^B",
      "name": "Everest Re Group, Ltd."
  },
  {
      "symbol": "RECN",
      "name": "Resources Connection, Inc."
  },
  {
      "symbol": "RECV",
      "name": "Recovery Energy, Inc."
  },
  {
      "symbol": "REDF",
      "name": "Rediff.com India Limited"
  },
  {
      "symbol": "REE",
      "name": "Rare Element Resources Ltd."
  },
  {
      "symbol": "REED",
      "name": "Reeds, Inc."
  },
  {
      "symbol": "REFR",
      "name": "Research Frontiers Incorporated"
  },
  {
      "symbol": "REG",
      "name": "Regency Centers Corporation"
  },
  {
      "symbol": "REG^E",
      "name": "Regency Centers Corporation"
  },
  {
      "symbol": "REG^F",
      "name": "Regency Centers Corporation"
  },
  {
      "symbol": "REGI",
      "name": "Renewable Energy Group, Inc."
  },
  {
      "symbol": "REGN",
      "name": "Regeneron Pharmaceuticals, Inc."
  },
  {
      "symbol": "REIS",
      "name": "Reis, Inc"
  },
  {
      "symbol": "RELL",
      "name": "Richardson Electronics, Ltd."
  },
  {
      "symbol": "RELV",
      "name": "Reliv&#39; International, Inc."
  },
  {
      "symbol": "REN           ",
      "name": "Resolute Energy Corporation"
  },
  {
      "symbol": "REN/WS",
      "name": "Resolute Energy Corporation"
  },
  {
      "symbol": "RENN",
      "name": "Renren Inc."
  },
  {
      "symbol": "RENT",
      "name": "Rentrak Corporation"
  },
  {
      "symbol": "RES",
      "name": "RPC, Inc."
  },
  {
      "symbol": "REV",
      "name": "Revlon, Inc."
  },
  {
      "symbol": "REX",
      "name": "REX American Resources Corporation"
  },
  {
      "symbol": "REXI",
      "name": "Resource America, Inc."
  },
  {
      "symbol": "REXX",
      "name": "Rex Energy Corporation"
  },
  {
      "symbol": "RF",
      "name": "Regions Financial Corporation"
  },
  {
      "symbol": "RF^Z",
      "name": "Regions Financial Corporation"
  },
  {
      "symbol": "RFA",
      "name": "BlackRock Florida Investment Quality Municipal Trust Inc. (The"
  },
  {
      "symbol": "RFI",
      "name": "Cohen & Steers Total Return Realty Fund, Inc."
  },
  {
      "symbol": "RFIL",
      "name": "RF Industries, Ltd."
  },
  {
      "symbol": "RFMD",
      "name": "RF Micro Devices, Inc."
  },
  {
      "symbol": "RFMI",
      "name": "RF Monolithics, Inc."
  },
  {
      "symbol": "RFO^A",
      "name": "Royce Focus Trust, Inc."
  },
  {
      "symbol": "RGA",
      "name": "Reinsurance Group of America, Incorporated"
  },
  {
      "symbol": "RGC",
      "name": "Regal Entertainment Group"
  },
  {
      "symbol": "RGCO",
      "name": "RGC Resources Inc."
  },
  {
      "symbol": "RGDX",
      "name": "Response Genetics, Inc."
  },
  {
      "symbol": "RGEN",
      "name": "Repligen Corporation"
  },
  {
      "symbol": "RGLD",
      "name": "Royal Gold, Inc."
  },
  {
      "symbol": "RGP",
      "name": "Regency Energy Partners LP"
  },
  {
      "symbol": "RGR",
      "name": "Sturm, Ruger & Company, Inc."
  },
  {
      "symbol": "RGS",
      "name": "Regis Corporation"
  },
  {
      "symbol": "RHI",
      "name": "Robert Half International Inc."
  },
  {
      "symbol": "RHT",
      "name": "Red Hat, Inc."
  },
  {
      "symbol": "RIC",
      "name": "Richmont Mines, Inc."
  },
  {
      "symbol": "RICK",
      "name": "Rick&#39;s Cabaret International, Inc."
  },
  {
      "symbol": "RIF",
      "name": "RMR Real Estate Income Fund."
  },
  {
      "symbol": "RIG",
      "name": "Transocean Inc."
  },
  {
      "symbol": "RIGL",
      "name": "Rigel Pharmaceuticals, Inc."
  },
  {
      "symbol": "RIMG",
      "name": "Rimage Corporation"
  },
  {
      "symbol": "RIMM",
      "name": "Research in Motion Limited"
  },
  {
      "symbol": "RIO",
      "name": "Rio Tinto Plc"
  },
  {
      "symbol": "RIT",
      "name": "LMP Real Estate Income Fund Inc"
  },
  {
      "symbol": "RITT",
      "name": "RIT Technologies Ltd."
  },
  {
      "symbol": "RIVR",
      "name": "River Valley Bancorp."
  },
  {
      "symbol": "RJD",
      "name": "Raymond James Financial, Inc."
  },
  {
      "symbol": "RJET",
      "name": "Republic Airways Holdings, Inc."
  },
  {
      "symbol": "RJF",
      "name": "Raymond James Financial, Inc."
  },
  {
      "symbol": "RKT",
      "name": "Rock-Tenn Company"
  },
  {
      "symbol": "RL",
      "name": "Ralph Lauren Corporation"
  },
  {
      "symbol": "RLD",
      "name": "RealD Inc"
  },
  {
      "symbol": "RLGT",
      "name": "Radiant Logistics, Inc."
  },
  {
      "symbol": "RLH",
      "name": "Red Lion Hotels Corporation"
  },
  {
      "symbol": "RLH^A",
      "name": "Red Lion Hotels Corporation"
  },
  {
      "symbol": "RLI",
      "name": "RLI Corp."
  },
  {
      "symbol": "RLJ",
      "name": "RLJ Lodging Trust"
  },
  {
      "symbol": "RLOC",
      "name": "ReachLocal, Inc."
  },
  {
      "symbol": "RLOG",
      "name": "Rand Logistics, Inc."
  },
  {
      "symbol": "RM",
      "name": "Regional Management Corp."
  },
  {
      "symbol": "RMBS",
      "name": "Rambus, Inc."
  },
  {
      "symbol": "RMCF",
      "name": "Rocky Mountain Chocolate Factory, Inc."
  },
  {
      "symbol": "RMD",
      "name": "ResMed Inc."
  },
  {
      "symbol": "RMKR",
      "name": "Rainmaker Systems, Inc."
  },
  {
      "symbol": "RMT",
      "name": "Royce Micro-Cap Trust, Inc."
  },
  {
      "symbol": "RMT^A",
      "name": "Royce Micro-Cap Trust, Inc."
  },
  {
      "symbol": "RMTI",
      "name": "Rockwell Medical Technologies, Inc."
  },
  {
      "symbol": "RMTR",
      "name": "Ramtron International Corporation"
  },
  {
      "symbol": "RNDY",
      "name": "Roundy&#39;s, Inc."
  },
  {
      "symbol": "RNE",
      "name": "Morgan Stanley Eastern Europe Fund, Inc."
  },
  {
      "symbol": "RNET",
      "name": "RigNet, Inc."
  },
  {
      "symbol": "RNF",
      "name": "Rentech Nitrogen Partners, L.P."
  },
  {
      "symbol": "RNIN",
      "name": "Wireless Ronin Technologies, Inc."
  },
  {
      "symbol": "RNJ",
      "name": "BlackRock New Jersey Investment Quality Municipal Trust Inc."
  },
  {
      "symbol": "RNN",
      "name": "Rexahn Pharmaceuticals, Inc."
  },
  {
      "symbol": "RNO",
      "name": "Rhino Resource Partners LP"
  },
  {
      "symbol": "RNP",
      "name": "Cohen & Steers Reit and Preferred Income Fund Inc"
  },
  {
      "symbol": "RNR",
      "name": "RenaissanceRe Holdings Ltd."
  },
  {
      "symbol": "RNR^C",
      "name": "RenaissanceRe Holdings Ltd."
  },
  {
      "symbol": "RNR^D",
      "name": "RenaissanceRe Holdings Ltd."
  },
  {
      "symbol": "RNST",
      "name": "Renasant Corporation"
  },
  {
      "symbol": "RNWK",
      "name": "RealNetworks, Inc."
  },
  {
      "symbol": "RNY",
      "name": "BlackRock New York Investment Quality Municipal Trust Inc. (Th"
  },
  {
      "symbol": "ROC",
      "name": "Rockwood Holdings, Inc."
  },
  {
      "symbol": "ROCK",
      "name": "Gibraltar Industries, Inc."
  },
  {
      "symbol": "ROCM",
      "name": "Rochester Medical Corporation"
  },
  {
      "symbol": "RODM",
      "name": "Rodman & Renshaw Capital Group, Inc."
  },
  {
      "symbol": "ROG",
      "name": "Rogers Corporation"
  },
  {
      "symbol": "ROIA",
      "name": "Radio One, Inc."
  },
  {
      "symbol": "ROIAK",
      "name": "Radio One, Inc."
  },
  {
      "symbol": "ROIC",
      "name": "Retail Opportunity Investments Corp."
  },
  {
      "symbol": "ROICU",
      "name": "Retail Opportunity Investments Corp."
  },
  {
      "symbol": "ROICW",
      "name": "Retail Opportunity Investments Corp."
  },
  {
      "symbol": "ROIQ",
      "name": "ROI Acquisition Corp."
  },
  {
      "symbol": "ROIQU",
      "name": "ROI Acquisition Corp."
  },
  {
      "symbol": "ROIQW",
      "name": "ROI Acquisition Corp."
  },
  {
      "symbol": "ROK",
      "name": "Rockwell Automation, Inc."
  },
  {
      "symbol": "ROL",
      "name": "Rollins, Inc."
  },
  {
      "symbol": "ROLL",
      "name": "RBC Bearings Incorporated"
  },
  {
      "symbol": "ROMA",
      "name": "Roma Financial Corporation"
  },
  {
      "symbol": "ROP",
      "name": "Roper Industries, Inc."
  },
  {
      "symbol": "ROSE",
      "name": "Rosetta Resources Inc."
  },
  {
      "symbol": "ROSG",
      "name": "Rosetta Genomics Ltd."
  },
  {
      "symbol": "ROST",
      "name": "Ross Stores, Inc."
  },
  {
      "symbol": "ROVI",
      "name": "Rovi Corporation"
  },
  {
      "symbol": "ROX",
      "name": "Castle Brands, Inc."
  },
  {
      "symbol": "ROYL",
      "name": "Royale Energy, Inc."
  },
  {
      "symbol": "ROYT",
      "name": "Pacific Coast Oil Trust"
  },
  {
      "symbol": "RP",
      "name": "RealPage, Inc."
  },
  {
      "symbol": "RPAI",
      "name": "Retail Properties of America, Inc."
  },
  {
      "symbol": "RPI",
      "name": "Roberts Realty Investors, Inc."
  },
  {
      "symbol": "RPM",
      "name": "RPM International Inc."
  },
  {
      "symbol": "RPRX",
      "name": "Repros Therapeutics Inc."
  },
  {
      "symbol": "RPRXW",
      "name": "Repros Therapeutics Inc."
  },
  {
      "symbol": "RPRXZ",
      "name": "Repros Therapeutics Inc."
  },
  {
      "symbol": "RPT",
      "name": "Ramco-Gershenson Properties Trust"
  },
  {
      "symbol": "RPT^D",
      "name": "Ramco-Gershenson Properties Trust"
  },
  {
      "symbol": "RPTP",
      "name": "Raptor Pharmaceutical Corp."
  },
  {
      "symbol": "RPXC",
      "name": "RPX Corporation"
  },
  {
      "symbol": "RQI",
      "name": "Cohen & Steers Quality Income Realty Fund Inc"
  },
  {
      "symbol": "RRC",
      "name": "Range Resources Corporation"
  },
  {
      "symbol": "RRD",
      "name": "R.R. Donnelley & Sons Company"
  },
  {
      "symbol": "RRGB",
      "name": "Red Robin Gourmet Burgers, Inc."
  },
  {
      "symbol": "RRMS",
      "name": "Rose Rock Midstream, L.P."
  },
  {
      "symbol": "RRST",
      "name": "RRSat Global Communications Network Ltd."
  },
  {
      "symbol": "RRTS",
      "name": "Roadrunner Transportation Systems, Inc"
  },
  {
      "symbol": "RS",
      "name": "Reliance Steel & Aluminum Co."
  },
  {
      "symbol": "RSE",
      "name": "Rouse Properties, Inc."
  },
  {
      "symbol": "RSG",
      "name": "Republic Services, Inc."
  },
  {
      "symbol": "RSH",
      "name": "Radioshack Corporation"
  },
  {
      "symbol": "RSO",
      "name": "Resource Capital Corp."
  },
  {
      "symbol": "RSOL",
      "name": "Real Goods Solar, Inc."
  },
  {
      "symbol": "RST",
      "name": "Rosetta Stone"
  },
  {
      "symbol": "RSTI",
      "name": "Rofin-Sinar Technologies, Inc."
  },
  {
      "symbol": "RSYS",
      "name": "RadiSys Corporation"
  },
  {
      "symbol": "RT",
      "name": "Ruby Tuesday, Inc."
  },
  {
      "symbol": "RTEC",
      "name": "Rudolph Technologies, Inc."
  },
  {
      "symbol": "RTI",
      "name": "RTI International Metals, Inc."
  },
  {
      "symbol": "RTIX",
      "name": "RTI Biologics, Inc."
  },
  {
      "symbol": "RTK",
      "name": "Rentech, Inc."
  },
  {
      "symbol": "RTLX",
      "name": "Retalix Ltd."
  },
  {
      "symbol": "RTN",
      "name": "Raytheon Company"
  },
  {
      "symbol": "RUE",
      "name": "rue21, inc."
  },
  {
      "symbol": "RUK",
      "name": "Reed Elsevier PLC"
  },
  {
      "symbol": "RUSHA",
      "name": "Rush Enterprises, Inc."
  },
  {
      "symbol": "RUSHB",
      "name": "Rush Enterprises, Inc."
  },
  {
      "symbol": "RUTH",
      "name": "Ruth&#39;s Hospitality Group, Inc."
  },
  {
      "symbol": "RVBD",
      "name": "Riverbed Technology, Inc."
  },
  {
      "symbol": "RVM",
      "name": "Revett Minerals Inc."
  },
  {
      "symbol": "RVP",
      "name": "Retractable Technologies, Inc."
  },
  {
      "symbol": "RVR",
      "name": "White River Capital, Inc."
  },
  {
      "symbol": "RVSB",
      "name": "Riverview Bancorp Inc"
  },
  {
      "symbol": "RVSN",
      "name": "RADVision Ltd."
  },
  {
      "symbol": "RVT",
      "name": "Royce Value Trust, Inc."
  },
  {
      "symbol": "RVT^B",
      "name": "Royce Value Trust, Inc."
  },
  {
      "symbol": "RWC",
      "name": "RELM Wireless Corporation"
  },
  {
      "symbol": "RWT",
      "name": "Redwood Trust, Inc."
  },
  {
      "symbol": "RXN",
      "name": "Rexnord Corporation"
  },
  {
      "symbol": "RY",
      "name": "Royal Bank Of Canada"
  },
  {
      "symbol": "RYAAY",
      "name": "Ryanair Holdings plc"
  },
  {
      "symbol": "RYL",
      "name": "Ryland Group, Inc. (The)"
  },
  {
      "symbol": "RYN",
      "name": "Rayonier Inc. REIT"
  },
  {
      "symbol": "S",
      "name": "Sprint  Nextel Corporation"
  },
  {
      "symbol": "SA",
      "name": "Seabridge Gold, Inc."
  },
  {
      "symbol": "SAAS",
      "name": "inContact, Inc."
  },
  {
      "symbol": "SAB",
      "name": "Grupo Casa Saba, S.A. de C.V."
  },
  {
      "symbol": "SABA",
      "name": "Saba Software, Inc."
  },
  {
      "symbol": "SAFM",
      "name": "Sanderson Farms, Inc."
  },
  {
      "symbol": "SAFT",
      "name": "Safety Insurance Group, Inc."
  },
  {
      "symbol": "SAH",
      "name": "Sonic Automotive, Inc."
  },
  {
      "symbol": "SAI",
      "name": "SAIC Inc"
  },
  {
      "symbol": "SAIA",
      "name": "Saia, Inc."
  },
  {
      "symbol": "SAL",
      "name": "Salisbury Bancorp, Inc."
  },
  {
      "symbol": "SALM",
      "name": "Salem Communications Corporation"
  },
  {
      "symbol": "SAM",
      "name": "Boston Beer Company, Inc. (The)"
  },
  {
      "symbol": "SANM",
      "name": "Sanmina-SCI Corporation"
  },
  {
      "symbol": "SANW",
      "name": "S&W Seed Company"
  },
  {
      "symbol": "SANWW",
      "name": "S&W Seed Company"
  },
  {
      "symbol": "SANWZ",
      "name": "S&W Seed Company"
  },
  {
      "symbol": "SAP",
      "name": "SAP AG"
  },
  {
      "symbol": "SAPE",
      "name": "Sapient Corporation"
  },
  {
      "symbol": "SAPX",
      "name": "Seven Arts Entertainment, Inc."
  },
  {
      "symbol": "SAR",
      "name": "Saratoga Investment Corp"
  },
  {
      "symbol": "SARA",
      "name": "Saratoga Resources Inc"
  },
  {
      "symbol": "SASR",
      "name": "Sandy Spring Bancorp, Inc."
  },
  {
      "symbol": "SATC",
      "name": "SatCon Technology Corporation"
  },
  {
      "symbol": "SATS",
      "name": "EchoStar Corporation"
  },
  {
      "symbol": "SAVB",
      "name": "The Savannah Bancorp, Inc."
  },
  {
      "symbol": "SAVE",
      "name": "Spirit Airlines, Inc."
  },
  {
      "symbol": "SB",
      "name": "Safe Bulkers, Inc"
  },
  {
      "symbol": "SBAC",
      "name": "SBA Communications Corporation"
  },
  {
      "symbol": "SBBX",
      "name": "Sussex Bancorp"
  },
  {
      "symbol": "SBCF",
      "name": "Seacoast Banking Corporation of Florida"
  },
  {
      "symbol": "SBGI",
      "name": "Sinclair Broadcast Group, Inc."
  },
  {
      "symbol": "SBH",
      "name": "Sally Beauty Holdings, Inc."
  },
  {
      "symbol": "SBI",
      "name": "Western Asset Intermediate Muni Fund Inc"
  },
  {
      "symbol": "SBLK",
      "name": "Star Bulk Carriers Corp."
  },
  {
      "symbol": "SBNY",
      "name": "Signature Bank"
  },
  {
      "symbol": "SBNYW",
      "name": "Signature Bank"
  },
  {
      "symbol": "SBR",
      "name": "Sabine Royalty Trust"
  },
  {
      "symbol": "SBRA",
      "name": "Sabra Healthcare REIT, Inc."
  },
  {
      "symbol": "SBS",
      "name": "Companhia de saneamento Basico Do Estado De Sao Paulo - Sabesp"
  },
  {
      "symbol": "SBSA",
      "name": "Spanish Broadcasting System, Inc."
  },
  {
      "symbol": "SBSI",
      "name": "Southside Bancshares, Inc."
  },
  {
      "symbol": "SBUX",
      "name": "Starbucks Corporation"
  },
  {
      "symbol": "SBW",
      "name": "Western Asset Worldwide Income Fund Inc."
  },
  {
      "symbol": "SBX",
      "name": "SeaBright Holdings, Inc."
  },
  {
      "symbol": "SCBT",
      "name": "SCBT Financial Corporation"
  },
  {
      "symbol": "SCCO",
      "name": "Southern Copper Corporation"
  },
  {
      "symbol": "SCD",
      "name": "LMP Capital and Income Fund Inc."
  },
  {
      "symbol": "SCE^B",
      "name": "Southern California Edison Company"
  },
  {
      "symbol": "SCE^C",
      "name": "Southern California Edison Company"
  },
  {
      "symbol": "SCE^D",
      "name": "Southern California Edison Company"
  },
  {
      "symbol": "SCE^E",
      "name": "Southern California Edison Company"
  },
  {
      "symbol": "SCEI",
      "name": "Sino Clean Energy Inc."
  },
  {
      "symbol": "SCG",
      "name": "Scana Corporation"
  },
  {
      "symbol": "SCGQ",
      "name": "SCG Financial Acquistion Corp"
  },
  {
      "symbol": "SCHL",
      "name": "Scholastic Corporation"
  },
  {
      "symbol": "SCHN",
      "name": "Schnitzer Steel Industries, Inc."
  },
  {
      "symbol": "SCHS",
      "name": "School Specialty, Inc."
  },
  {
      "symbol": "SCHW",
      "name": "The Charles Schwab Corporation"
  },
  {
      "symbol": "SCI",
      "name": "Service Corporation International"
  },
  {
      "symbol": "SCIL",
      "name": "Scientific Learning Corporation"
  },
  {
      "symbol": "SCKT",
      "name": "Socket Mobile, Inc."
  },
  {
      "symbol": "SCL",
      "name": "Stepan Company"
  },
  {
      "symbol": "SCL^",
      "name": "Stepan Company"
  },
  {
      "symbol": "SCLN",
      "name": "SciClone Pharmaceuticals, Inc."
  },
  {
      "symbol": "SCLP",
      "name": "Russell Exchange Traded Funds Trust Russell Small Cap Low P/E "
  },
  {
      "symbol": "SCMF",
      "name": "Southern Community Financial Corporation"
  },
  {
      "symbol": "SCMFO",
      "name": "Southern Community Financial Corporation"
  },
  {
      "symbol": "SCMP",
      "name": "Sucampo Pharmaceuticals, Inc."
  },
  {
      "symbol": "SCMR",
      "name": "Sycamore Networks, Inc."
  },
  {
      "symbol": "SCOG",
      "name": "Russell Exchange Traded Funds Trust Russell Small Cap Consiste"
  },
  {
      "symbol": "SCOK",
      "name": "SinoCoking Coal and Coke Chemical Industries, Inc"
  },
  {
      "symbol": "SCON",
      "name": "Superconductor Technologies Inc."
  },
  {
      "symbol": "SCOR",
      "name": "comScore, Inc."
  },
  {
      "symbol": "SCR",
      "name": "Simcere Pharmaceutical Group"
  },
  {
      "symbol": "SCS",
      "name": "Steelcase Inc."
  },
  {
      "symbol": "SCSC",
      "name": "ScanSource, Inc."
  },
  {
      "symbol": "SCSS",
      "name": "Select Comfort Corporation"
  },
  {
      "symbol": "SCTR",
      "name": "Russell Exchange Traded Funds Trust Russell Small Cap Contrari"
  },
  {
      "symbol": "SCU",
      "name": "Scana Corporation"
  },
  {
      "symbol": "SCVL",
      "name": "Shoe Carnival, Inc."
  },
  {
      "symbol": "SCX",
      "name": "L.S. Starrett Company (The)"
  },
  {
      "symbol": "SD",
      "name": "Sandridge Energy Inc."
  },
  {
      "symbol": "SDBT",
      "name": "SoundBite Communications, Inc."
  },
  {
      "symbol": "SDIX",
      "name": "Strategic Diagnostics Inc."
  },
  {
      "symbol": "SDO^A",
      "name": "San Diego Gas & Electric Company"
  },
  {
      "symbol": "SDO^B",
      "name": "San Diego Gas & Electric Company"
  },
  {
      "symbol": "SDO^C",
      "name": "San Diego Gas & Electric Company"
  },
  {
      "symbol": "SDO^H",
      "name": "San Diego Gas & Electric Company"
  },
  {
      "symbol": "SDR",
      "name": "SandRidge Mississippian Trust II"
  },
  {
      "symbol": "SDRL",
      "name": "Seadrill Limited"
  },
  {
      "symbol": "SDT",
      "name": "SandRidge Mississippian Trust I"
  },
  {
      "symbol": "SE",
      "name": "Spectra Energy Corp"
  },
  {
      "symbol": "SEAC",
      "name": "SeaChange International, Inc."
  },
  {
      "symbol": "SEB",
      "name": "Seaboard Corporation"
  },
  {
      "symbol": "SED",
      "name": "SED International Holdings Inc"
  },
  {
      "symbol": "SEE",
      "name": "Sealed Air Corporation"
  },
  {
      "symbol": "SEED",
      "name": "Origin Agritech Limited"
  },
  {
      "symbol": "SEH",
      "name": "Spartech Corporation"
  },
  {
      "symbol": "SEIC",
      "name": "SEI Investments Company"
  },
  {
      "symbol": "SEM",
      "name": "Select Medical Holdings Corporation"
  },
  {
      "symbol": "SEMG",
      "name": "Semgroup Corporation"
  },
  {
      "symbol": "SEMG/WS",
      "name": "Semgroup Corporation"
  },
  {
      "symbol": "SENEA",
      "name": "Seneca Foods Corp."
  },
  {
      "symbol": "SENEB",
      "name": "Seneca Foods Corp."
  },
  {
      "symbol": "SEP",
      "name": "Spectra Energy Partners, LP"
  },
  {
      "symbol": "SEV",
      "name": "Sevcon, Inc."
  },
  {
      "symbol": "SF",
      "name": "Stifel Financial Corporation"
  },
  {
      "symbol": "SFB",
      "name": "Stifel Financial Corporation"
  },
  {
      "symbol": "SFD",
      "name": "Smithfield Foods, Inc."
  },
  {
      "symbol": "SFE",
      "name": "Safeguard Scientifics, Inc."
  },
  {
      "symbol": "SFG",
      "name": "StanCorp Financial Group, Inc."
  },
  {
      "symbol": "SFI",
      "name": "iStar Financial Inc."
  },
  {
      "symbol": "SFI^D",
      "name": "iStar Financial Inc."
  },
  {
      "symbol": "SFI^E",
      "name": "iStar Financial Inc."
  },
  {
      "symbol": "SFI^F",
      "name": "iStar Financial Inc."
  },
  {
      "symbol": "SFI^G",
      "name": "iStar Financial Inc."
  },
  {
      "symbol": "SFI^I",
      "name": "iStar Financial Inc."
  },
  {
      "symbol": "SFL",
      "name": "Ship Finance International Limited"
  },
  {
      "symbol": "SFLY",
      "name": "Shutterfly, Inc."
  },
  {
      "symbol": "SFNC",
      "name": "Simmons First National Corporation"
  },
  {
      "symbol": "SFST",
      "name": "Southern First Bancshares, Inc."
  },
  {
      "symbol": "SFUN",
      "name": "SouFun Holdings Limited"
  },
  {
      "symbol": "SFY",
      "name": "Swift Energy Company"
  },
  {
      "symbol": "SGA",
      "name": "Saga Communications, Inc."
  },
  {
      "symbol": "SGB",
      "name": "Southwest Georgia Financial Corporation"
  },
  {
      "symbol": "SGC",
      "name": "Superior Uniform Group, Inc."
  },
  {
      "symbol": "SGEN",
      "name": "Seattle Genetics, Inc."
  },
  {
      "symbol": "SGF",
      "name": "Singapore Fund, Inc. (The)"
  },
  {
      "symbol": "SGGG",
      "name": "Russell Exchange Traded Funds Trust Russell Small Cap Aggressi"
  },
  {
      "symbol": "SGI",
      "name": "Silicon Graphics International Corp"
  },
  {
      "symbol": "SGK",
      "name": "Schawk, Inc."
  },
  {
      "symbol": "SGL",
      "name": "Strategic Global Income Fund, Inc."
  },
  {
      "symbol": "SGMA",
      "name": "SigmaTron International, Inc."
  },
  {
      "symbol": "SGMO",
      "name": "Sangamo BioSciences, Inc."
  },
  {
      "symbol": "SGMS",
      "name": "Scientific Games Corp"
  },
  {
      "symbol": "SGNT",
      "name": "Sagent Pharmaceuticals, Inc."
  },
  {
      "symbol": "SGOC",
      "name": "SGOCO Group, Ltd"
  },
  {
      "symbol": "SGRP",
      "name": "SPAR Group, Inc."
  },
  {
      "symbol": "SGU",
      "name": "Star Gas Partners, L.P."
  },
  {
      "symbol": "SGY",
      "name": "Stone Energy Corporation"
  },
  {
      "symbol": "SGYP",
      "name": "Synergy Pharmaceuticals, Inc."
  },
  {
      "symbol": "SGYPU",
      "name": "Synergy Pharmaceuticals, Inc."
  },
  {
      "symbol": "SGYPW",
      "name": "Synergy Pharmaceuticals, Inc."
  },
  {
      "symbol": "SGZ",
      "name": "Selective Insurance Group, Inc."
  },
  {
      "symbol": "SHAW",
      "name": "Shaw Group Inc. (The)"
  },
  {
      "symbol": "SHBI",
      "name": "Shore Bancshares Inc"
  },
  {
      "symbol": "SHEN",
      "name": "Shenandoah Telecommunications Co"
  },
  {
      "symbol": "SHFL",
      "name": "Shuffle Master, Inc."
  },
  {
      "symbol": "SHG",
      "name": "Shinhan Financial Group Co Ltd"
  },
  {
      "symbol": "SHI",
      "name": "SINOPEC Shangai Petrochemical Company, Ltd."
  },
  {
      "symbol": "SHIP",
      "name": "Seanergy Maritime Holdings Corp"
  },
  {
      "symbol": "SHLD",
      "name": "Sears Holdings Corporation"
  },
  {
      "symbol": "SHLM",
      "name": "A. Schulman, Inc."
  },
  {
      "symbol": "SHLO",
      "name": "Shiloh Industries, Inc."
  },
  {
      "symbol": "SHO",
      "name": "Sunstone Hotel Investors, Inc."
  },
  {
      "symbol": "SHO^A",
      "name": "Sunstone Hotel Investors, Inc."
  },
  {
      "symbol": "SHO^D",
      "name": "Sunstone Hotel Investors, Inc."
  },
  {
      "symbol": "SHOO",
      "name": "Steven Madden, Ltd."
  },
  {
      "symbol": "SHOR",
      "name": "ShoreTel, Inc."
  },
  {
      "symbol": "SHP",
      "name": "ShangPharma Corporation"
  },
  {
      "symbol": "SHPGY",
      "name": "Shire plc"
  },
  {
      "symbol": "SHS",
      "name": "Sauer-Danfoss Inc."
  },
  {
      "symbol": "SHW",
      "name": "Sherwin-Williams Company (The)"
  },
  {
      "symbol": "SHZ",
      "name": "China Shen Zhou Mining & Resources, Inc."
  },
  {
      "symbol": "SI",
      "name": "Siemens AG"
  },
  {
      "symbol": "SIAL",
      "name": "Sigma-Aldrich Corporation"
  },
  {
      "symbol": "SIBC",
      "name": "State Investors Bancorp, Inc."
  },
  {
      "symbol": "SID",
      "name": "National Steel Company"
  },
  {
      "symbol": "SIEB",
      "name": "Siebert Financial Corp."
  },
  {
      "symbol": "SIF",
      "name": "SIFCO Industries, Inc."
  },
  {
      "symbol": "SIFI",
      "name": "SI Financial Group, Inc."
  },
  {
      "symbol": "SIFY",
      "name": "Sify Technologies Limited"
  },
  {
      "symbol": "SIG",
      "name": "Signet Jewelers Limited"
  },
  {
      "symbol": "SIGA",
      "name": "SIGA Technologies Inc."
  },
  {
      "symbol": "SIGI",
      "name": "Selective Insurance Group, Inc."
  },
  {
      "symbol": "SIGM",
      "name": "Sigma Designs, Inc."
  },
  {
      "symbol": "SIHI",
      "name": "SinoHub, Inc"
  },
  {
      "symbol": "SILC",
      "name": "Silicom Ltd"
  },
  {
      "symbol": "SILU",
      "name": "Sprott Resource Lending Corp."
  },
  {
      "symbol": "SIM",
      "name": "Grupo Simec, S.A. de C.V."
  },
  {
      "symbol": "SIMG",
      "name": "Silicon Image, Inc."
  },
  {
      "symbol": "SIMO",
      "name": "Silicon Motion Technology Corporation"
  },
  {
      "symbol": "SINA",
      "name": "Sina Corporation"
  },
  {
      "symbol": "SINO",
      "name": "Sino-Global Shipping America, Ltd."
  },
  {
      "symbol": "SIR",
      "name": "Select Income REIT"
  },
  {
      "symbol": "SIRI",
      "name": "Sirius XM Radio Inc."
  },
  {
      "symbol": "SIRO",
      "name": "Sirona Dental Systems, Inc."
  },
  {
      "symbol": "SIVB",
      "name": "SVB Financial Group"
  },
  {
      "symbol": "SIVBO",
      "name": "SVB Financial Group"
  },
  {
      "symbol": "SIX",
      "name": "Six Flags Entertainment Corporation New"
  },
  {
      "symbol": "SJI",
      "name": "South Jersey Industries, Inc."
  },
  {
      "symbol": "SJM",
      "name": "J.M. Smucker Company (The)"
  },
  {
      "symbol": "SJR",
      "name": "Shaw Communications Inc."
  },
  {
      "symbol": "SJT",
      "name": "San Juan Basin Royalty Trust"
  },
  {
      "symbol": "SJW",
      "name": "SJW Corporation"
  },
  {
      "symbol": "SKBI",
      "name": "Skystar Bio-Pharmaceutical Company"
  },
  {
      "symbol": "SKH",
      "name": "Skilled Healthcare Group, Inc."
  },
  {
      "symbol": "SKM",
      "name": "SK Telecom Corporation, Ltd."
  },
  {
      "symbol": "SKS",
      "name": "Saks Incorporated"
  },
  {
      "symbol": "SKT",
      "name": "Tanger Factory Outlet Centers, Inc."
  },
  {
      "symbol": "SKUL",
      "name": "Skullcandy, Inc."
  },
  {
      "symbol": "SKX",
      "name": "Skechers U.S.A., Inc."
  },
  {
      "symbol": "SKY",
      "name": "Skyline Corporation"
  },
  {
      "symbol": "SKYW",
      "name": "SkyWest, Inc."
  },
  {
      "symbol": "SKYY",
      "name": "First Trust Exchange-Traded Fund II First Trust ISE Cloud Comp"
  },
  {
      "symbol": "SLA",
      "name": "American Select Portfolio, Inc."
  },
  {
      "symbol": "SLAB",
      "name": "Silicon Laboratories, Inc."
  },
  {
      "symbol": "SLB",
      "name": "Schlumberger N.V."
  },
  {
      "symbol": "SLCA",
      "name": "U.S. Silica Holdings, Inc."
  },
  {
      "symbol": "SLE",
      "name": "Sara Lee Corporation"
  },
  {
      "symbol": "SLF",
      "name": "Sun Life Financial Inc."
  },
  {
      "symbol": "SLG",
      "name": "SL Green Realty Corporation"
  },
  {
      "symbol": "SLG^C",
      "name": "SL Green Realty Corporation"
  },
  {
      "symbol": "SLG^D",
      "name": "SL Green Realty Corporation"
  },
  {
      "symbol": "SLGN",
      "name": "Silgan Holdings, Inc."
  },
  {
      "symbol": "SLH",
      "name": "Solera Holdings, Inc."
  },
  {
      "symbol": "SLI",
      "name": "SL Industries, Inc."
  },
  {
      "symbol": "SLM",
      "name": "SLM Corporation"
  },
  {
      "symbol": "SLMAP",
      "name": "SLM Corporation"
  },
  {
      "symbol": "SLMBP",
      "name": "SLM Corporation"
  },
  {
      "symbol": "SLP",
      "name": "Simulations Plus, Inc."
  },
  {
      "symbol": "SLRC",
      "name": "Solar Capital Ltd."
  },
  {
      "symbol": "SLT",
      "name": "Sterlite Industries (India) Limited"
  },
  {
      "symbol": "SLTC",
      "name": "Selectica, Inc."
  },
  {
      "symbol": "SLTM",
      "name": "Solta Medical, Inc"
  },
  {
      "symbol": "SLW",
      "name": "Silver Wheaton Corp"
  },
  {
      "symbol": "SLXP",
      "name": "Salix Pharmaceuticals, Ltd."
  },
  {
      "symbol": "SM",
      "name": "SM Energy Company"
  },
  {
      "symbol": "SMA",
      "name": "Symmetry Medical Inc"
  },
  {
      "symbol": "SMBC",
      "name": "Southern Missouri Bancorp, Inc."
  },
  {
      "symbol": "SMBL",
      "name": "Smart Balance Inc"
  },
  {
      "symbol": "SMCG",
      "name": "Millenium India Acquisition Company Inc."
  },
  {
      "symbol": "SMCI",
      "name": "Super Micro Computer, Inc."
  },
  {
      "symbol": "SMED",
      "name": "Sharps Compliance Corp"
  },
  {
      "symbol": "SMF",
      "name": "Salient MLP and Energy Infrastructure Fund"
  },
  {
      "symbol": "SMFG",
      "name": "Sumitomo Mitsui Financial Group Inc"
  },
  {
      "symbol": "SMG",
      "name": "Scotts Miracle-Gro Company (The)"
  },
  {
      "symbol": "SMI",
      "name": "Semiconductor  Manufacturing International Corporation"
  },
  {
      "symbol": "SMIT",
      "name": "Schmitt Industries, Inc."
  },
  {
      "symbol": "SMMF",
      "name": "Summit Financial Group, Inc."
  },
  {
      "symbol": "SMP",
      "name": "Standard Motor Products, Inc."
  },
  {
      "symbol": "SMRT",
      "name": "Stein Mart, Inc."
  },
  {
      "symbol": "SMS",
      "name": "Sims Metal Management Limited"
  },
  {
      "symbol": "SMSC",
      "name": "Standard Microsystems Corporation"
  },
  {
      "symbol": "SMSI",
      "name": "Smith Micro Software, Inc."
  },
  {
      "symbol": "SMT",
      "name": "SMART Technologies Inc."
  },
  {
      "symbol": "SMTC",
      "name": "Semtech Corporation"
  },
  {
      "symbol": "SMTX",
      "name": "SMTC Corporation"
  },
  {
      "symbol": "SN",
      "name": "Sanchez Energy Corporation"
  },
  {
      "symbol": "SNA",
      "name": "Snap-On Incorporated"
  },
  {
      "symbol": "SNAK",
      "name": "Inventure Foods, Inc."
  },
  {
      "symbol": "SNBC",
      "name": "Sun Bancorp, Inc."
  },
  {
      "symbol": "SNCR",
      "name": "Synchronoss Technologies, Inc."
  },
  {
      "symbol": "SNDK",
      "name": "SanDisk Corporation"
  },
  {
      "symbol": "SNE",
      "name": "Sony Corp Ord"
  },
  {
      "symbol": "SNFCA",
      "name": "Security National Financial Corporation"
  },
  {
      "symbol": "SNH",
      "name": "Senior Housing Properties Trust"
  },
  {
      "symbol": "SNHY",
      "name": "Sun Hydraulics Corporation"
  },
  {
      "symbol": "SNI",
      "name": "Scripps Networks Interactive, Inc"
  },
  {
      "symbol": "SNMX",
      "name": "Senomyx, Inc."
  },
  {
      "symbol": "SNN",
      "name": "Smith & Nephew SNATS, Inc."
  },
  {
      "symbol": "SNP",
      "name": "China Petroleum & Chemical Corporation"
  },
  {
      "symbol": "SNPS",
      "name": "Synopsys, Inc."
  },
  {
      "symbol": "SNSS",
      "name": "Sunesis Pharmaceuticals, Inc."
  },
  {
      "symbol": "SNT",
      "name": "Senesco Technologies Inc"
  },
  {
      "symbol": "SNTA",
      "name": "Synta Pharmaceuticals Corp."
  },
  {
      "symbol": "SNTS",
      "name": "Santarus, Inc."
  },
  {
      "symbol": "SNV",
      "name": "Synovus Financial Corp."
  },
  {
      "symbol": "SNV^T",
      "name": "Synovus Financial Corp."
  },
  {
      "symbol": "SNX",
      "name": "Synnex Corporation"
  },
  {
      "symbol": "SNY",
      "name": "Sanofi"
  },
  {
      "symbol": "SO",
      "name": "Southern Company (The)"
  },
  {
      "symbol": "SOA",
      "name": "Solutia Inc"
  },
  {
      "symbol": "SOA/WS",
      "name": "Solutia Inc"
  },
  {
      "symbol": "SOCB",
      "name": "Southcoast Financial Corporation"
  },
  {
      "symbol": "SOCL",
      "name": "Global X Funds Global X Social Media Index ETF"
  },
  {
      "symbol": "SODA",
      "name": "SodaStream International Ltd."
  },
  {
      "symbol": "SOFO",
      "name": "Sonic Foundry, Inc."
  },
  {
      "symbol": "SOHU",
      "name": "Sohu.com Inc."
  },
  {
      "symbol": "SOL",
      "name": "Renesola Ltd."
  },
  {
      "symbol": "SOMH",
      "name": "Somerset Hills Bancorp"
  },
  {
      "symbol": "SOMX",
      "name": "Somaxon Pharmaceuticals, Inc."
  },
  {
      "symbol": "SON",
      "name": "Sonoco Products Company"
  },
  {
      "symbol": "SONA",
      "name": "Southern National Bancorp of Virginia, Inc."
  },
  {
      "symbol": "SONC",
      "name": "Sonic Corp."
  },
  {
      "symbol": "SONS",
      "name": "Sonus Networks, Inc."
  },
  {
      "symbol": "SOQ",
      "name": "Sonde Resources Corp"
  },
  {
      "symbol": "SOR",
      "name": "Source Capital, Inc."
  },
  {
      "symbol": "SOR^",
      "name": "Source Capital, Inc."
  },
  {
      "symbol": "SORL",
      "name": "SORL Auto Parts, Inc."
  },
  {
      "symbol": "SOV^C",
      "name": "Santander Holdings USA, Inc."
  },
  {
      "symbol": "SOXX",
      "name": "iShares Goldman Sachs Semiconductor Index Fund"
  },
  {
      "symbol": "SPA",
      "name": "Sparton Corporation"
  },
  {
      "symbol": "SPAN",
      "name": "Span-America Medical Systems, Inc."
  },
  {
      "symbol": "SPAR",
      "name": "Spartan Motors, Inc."
  },
  {
      "symbol": "SPB           ",
      "name": "Spectrum Brands Holdings, Inc."
  },
  {
      "symbol": "SPBC",
      "name": "SP Bancorp, Inc."
  },
  {
      "symbol": "SPCHA",
      "name": "Sport Chalet, Inc."
  },
  {
      "symbol": "SPCHB",
      "name": "Sport Chalet, Inc."
  },
  {
      "symbol": "SPE",
      "name": "Special Opportunities Fund Inc."
  },
  {
      "symbol": "SPEX",
      "name": "Spherix Incorporated"
  },
  {
      "symbol": "SPF",
      "name": "Standard Pacific Corp"
  },
  {
      "symbol": "SPG",
      "name": "Simon Property Group, Inc."
  },
  {
      "symbol": "SPG^J",
      "name": "Simon Property Group, Inc."
  },
  {
      "symbol": "SPH",
      "name": "Suburban Propane Partners, L.P."
  },
  {
      "symbol": "SPIL",
      "name": "Siliconware Precision Industries Company, Ltd."
  },
  {
      "symbol": "SPIR",
      "name": "Spire Corporation"
  },
  {
      "symbol": "SPLK",
      "name": "Splunk Inc."
  },
  {
      "symbol": "SPLP",
      "name": "Steel Partners Holdings LP"
  },
  {
      "symbol": "SPLS",
      "name": "Staples, Inc."
  },
  {
      "symbol": "SPMD",
      "name": "SuperMedia Inc."
  },
  {
      "symbol": "SPN",
      "name": "Superior Energy Services, Inc."
  },
  {
      "symbol": "SPNC",
      "name": "The Spectranetics Corporation"
  },
  {
      "symbol": "SPNS",
      "name": "Sapiens International Corporation N.V."
  },
  {
      "symbol": "SPP",
      "name": "Sappi Limited"
  },
  {
      "symbol": "SPPI",
      "name": "Spectrum Pharmaceuticals, Inc."
  },
  {
      "symbol": "SPPR",
      "name": "Supertel Hospitality, Inc."
  },
  {
      "symbol": "SPPRO",
      "name": "Supertel Hospitality, Inc."
  },
  {
      "symbol": "SPPRP",
      "name": "Supertel Hospitality, Inc."
  },
  {
      "symbol": "SPR",
      "name": "Spirit Aerosystems Holdings, Inc."
  },
  {
      "symbol": "SPRD",
      "name": "Spreadtrum Communications, Inc."
  },
  {
      "symbol": "SPRO",
      "name": "SmartPros Ltd."
  },
  {
      "symbol": "SPRT",
      "name": "support.com, Inc."
  },
  {
      "symbol": "SPSC",
      "name": "SPS Commerce, Inc."
  },
  {
      "symbol": "SPTN",
      "name": "Spartan Stores, Inc."
  },
  {
      "symbol": "SPU",
      "name": "SkyPeople Fruit Juice, Inc."
  },
  {
      "symbol": "SPW",
      "name": "SPX Corporation"
  },
  {
      "symbol": "SPWR",
      "name": "SunPower Corporation"
  },
  {
      "symbol": "SQI",
      "name": "SciQuest, Inc."
  },
  {
      "symbol": "SQM",
      "name": "Sociedad Quimica y Minera S.A."
  },
  {
      "symbol": "SQNM",
      "name": "Sequenom, Inc."
  },
  {
      "symbol": "SQNS",
      "name": "Sequans Communications S.A."
  },
  {
      "symbol": "SQQQ",
      "name": "ProShares UltraPro Short QQQ "
  },
  {
      "symbol": "SR",
      "name": "Standard Register Company (The)"
  },
  {
      "symbol": "SRCE",
      "name": "1st Source Corporation"
  },
  {
      "symbol": "SRCL",
      "name": "Stericycle, Inc."
  },
  {
      "symbol": "SRDX",
      "name": "SurModics, Inc."
  },
  {
      "symbol": "SRE",
      "name": "Sempra Energy"
  },
  {
      "symbol": "SREV",
      "name": "ServiceSource International, Inc."
  },
  {
      "symbol": "SRF",
      "name": "The Cushing Royalty & Income Fund"
  },
  {
      "symbol": "SRI",
      "name": "Stoneridge, Inc."
  },
  {
      "symbol": "SRSL",
      "name": "SRS Labs, Inc."
  },
  {
      "symbol": "SRT",
      "name": "StarTek, Inc."
  },
  {
      "symbol": "SRV",
      "name": "The Cushing MLP Total Return Fund"
  },
  {
      "symbol": "SRZ",
      "name": "Sunrise Senior Living, Inc."
  },
  {
      "symbol": "SS^K",
      "name": "SiM Internal Test 9"
  },
  {
      "symbol": "SSBI",
      "name": "Summit State Bank"
  },
  {
      "symbol": "SSD",
      "name": "Simpson Manufacturing Company, Inc."
  },
  {
      "symbol": "SSE",
      "name": "Southern Connecticut Bancorp Inc"
  },
  {
      "symbol": "SSFN",
      "name": "Stewardship Financial Corp"
  },
  {
      "symbol": "SSH",
      "name": "Sunshine Heart Inc"
  },
  {
      "symbol": "SSI",
      "name": "Stage Stores, Inc."
  },
  {
      "symbol": "SSL",
      "name": "Sasol Ltd."
  },
  {
      "symbol": "SSN",
      "name": "Samson Oil & Gas Limited"
  },
  {
      "symbol": "SSNC",
      "name": "SS&C Technologies Holdings, Inc."
  },
  {
      "symbol": "SSP",
      "name": "E.W. Scripps Company (The)"
  },
  {
      "symbol": "SSRI",
      "name": "Silver Standard Resources, Inc"
  },
  {
      "symbol": "SSRX",
      "name": "3SBio Inc."
  },
  {
      "symbol": "SSS",
      "name": "Sovran Self Storage, Inc."
  },
  {
      "symbol": "SSW",
      "name": "Seaspan Corporation"
  },
  {
      "symbol": "SSW^C",
      "name": "Seaspan Corporation"
  },
  {
      "symbol": "SSY",
      "name": "SunLink Health Systems, Inc."
  },
  {
      "symbol": "SSYS",
      "name": "Stratasys, Inc."
  },
  {
      "symbol": "ST",
      "name": "Sensata Technologies Holding N.V."
  },
  {
      "symbol": "STAA",
      "name": "STAAR Surgical Company"
  },
  {
      "symbol": "STAG",
      "name": "Stag Industrial, Inc."
  },
  {
      "symbol": "STAG^A",
      "name": "Stag Industrial, Inc."
  },
  {
      "symbol": "STAN",
      "name": "Standard Parking Corporation"
  },
  {
      "symbol": "STB",
      "name": "Student Transportation Inc"
  },
  {
      "symbol": "STBA",
      "name": "S&T Bancorp, Inc."
  },
  {
      "symbol": "STBZ",
      "name": "State Bank Financial Corporation."
  },
  {
      "symbol": "STC",
      "name": "Stewart Information Services Corporation"
  },
  {
      "symbol": "STD",
      "name": "Banco Santander, S.A."
  },
  {
      "symbol": "STD^A",
      "name": "Banco Santander, S.A."
  },
  {
      "symbol": "STD^B",
      "name": "Banco Santander, S.A."
  },
  {
      "symbol": "STD^C",
      "name": "Banco Santander, S.A."
  },
  {
      "symbol": "STD^E",
      "name": "Banco Santander, S.A."
  },
  {
      "symbol": "STD^f",
      "name": "Banco Santander, S.A."
  },
  {
      "symbol": "STD^I",
      "name": "Banco Santander, S.A."
  },
  {
      "symbol": "STE",
      "name": "STERIS Corporation"
  },
  {
      "symbol": "STEC",
      "name": "STEC, Inc."
  },
  {
      "symbol": "STEI",
      "name": "Stewart Enterprises, Inc."
  },
  {
      "symbol": "STEL",
      "name": "StellarOne Corporation"
  },
  {
      "symbol": "STEM",
      "name": "StemCells, Inc."
  },
  {
      "symbol": "STFC",
      "name": "State Auto Financial Corporation"
  },
  {
      "symbol": "STI",
      "name": "SunTrust Banks, Inc."
  },
  {
      "symbol": "STI/WS/A",
      "name": "SunTrust Banks, Inc."
  },
  {
      "symbol": "STI/WS/B",
      "name": "SunTrust Banks, Inc."
  },
  {
      "symbol": "STI^A",
      "name": "SunTrust Banks, Inc."
  },
  {
      "symbol": "STI^Z",
      "name": "SunTrust Banks, Inc."
  },
  {
      "symbol": "STJ",
      "name": "St. Jude Medical, Inc."
  },
  {
      "symbol": "STK",
      "name": "Columbia Seligman Premium Technology Growth Fund, Inc"
  },
  {
      "symbol": "STKL",
      "name": "SunOpta, Inc."
  },
  {
      "symbol": "STL",
      "name": "Sterling Bancorp"
  },
  {
      "symbol": "STL^A",
      "name": "Sterling Bancorp"
  },
  {
      "symbol": "STLD",
      "name": "Steel Dynamics, Inc."
  },
  {
      "symbol": "STLY",
      "name": "Stanley Furniture Company, Inc."
  },
  {
      "symbol": "STM",
      "name": "STMicroelectronics N.V."
  },
  {
      "symbol": "STMP",
      "name": "Stamps.com Inc."
  },
  {
      "symbol": "STN",
      "name": "Stantec Inc"
  },
  {
      "symbol": "STND",
      "name": "Standard Financial Corp."
  },
  {
      "symbol": "STNG",
      "name": "Scorpio Tankers Inc."
  },
  {
      "symbol": "STNR",
      "name": "Steiner Leisure Limited"
  },
  {
      "symbol": "STO",
      "name": "Statoil ASA"
  },
  {
      "symbol": "STON",
      "name": "StoneMor Partners L.P."
  },
  {
      "symbol": "STP",
      "name": "Suntech Power Holdings Co., LTD."
  },
  {
      "symbol": "STR",
      "name": "Questar Corporation"
  },
  {
      "symbol": "STRA",
      "name": "Strayer Education, Inc."
  },
  {
      "symbol": "STRC",
      "name": "SRI/Surgical Express, Inc."
  },
  {
      "symbol": "STRI",
      "name": "STR Holdings, Inc"
  },
  {
      "symbol": "STRL",
      "name": "Sterling Construction Company Inc"
  },
  {
      "symbol": "STRM",
      "name": "Streamline Health Solutions, Inc."
  },
  {
      "symbol": "STRN",
      "name": "Sutron Corporation"
  },
  {
      "symbol": "STRS",
      "name": "Stratus Properties, Inc."
  },
  {
      "symbol": "STRT",
      "name": "Strattec Security Corporation"
  },
  {
      "symbol": "STS",
      "name": "Supreme Industries, Inc."
  },
  {
      "symbol": "STSA",
      "name": "Sterling Financial Corporation"
  },
  {
      "symbol": "STT",
      "name": "State Street Corporation"
  },
  {
      "symbol": "STV",
      "name": "China Digital TV Holding Co., Ltd."
  },
  {
      "symbol": "STWD",
      "name": "STARWOOD PROPERTY TRUST, INC."
  },
  {
      "symbol": "STX",
      "name": "Seagate Technology."
  },
  {
      "symbol": "STXS",
      "name": "Stereotaxis, Inc."
  },
  {
      "symbol": "STZ",
      "name": "Constellation Brands Inc"
  },
  {
      "symbol": "STZ/B",
      "name": "Constellation Brands Inc"
  },
  {
      "symbol": "SU",
      "name": "Suncor Energy  Inc."
  },
  {
      "symbol": "SUBK",
      "name": "Suffolk Bancorp"
  },
  {
      "symbol": "SUI",
      "name": "Sun Communities, Inc."
  },
  {
      "symbol": "SUMR",
      "name": "Summer Infant, Inc."
  },
  {
      "symbol": "SUN",
      "name": "Sunoco, Inc."
  },
  {
      "symbol": "SUNH",
      "name": "Sun Healthcare Group, Inc."
  },
  {
      "symbol": "SUNS",
      "name": "Solar Senior Capital Ltd."
  },
  {
      "symbol": "SUP",
      "name": "Superior Industries International, Inc."
  },
  {
      "symbol": "SUPN",
      "name": "Supernus Pharmaceuticals, Inc."
  },
  {
      "symbol": "SUPX",
      "name": "Supertex, Inc."
  },
  {
      "symbol": "SURG",
      "name": "Synergetics USA, Inc."
  },
  {
      "symbol": "SURW",
      "name": "SureWest Communications"
  },
  {
      "symbol": "SUS^A",
      "name": "Susquehanna Bancshares, Inc."
  },
  {
      "symbol": "SUSQ",
      "name": "Susquehanna Bancshares, Inc."
  },
  {
      "symbol": "SUSS",
      "name": "Susser Holdings Corporation"
  },
  {
      "symbol": "SUTR",
      "name": "Sutor Technology Group Limited"
  },
  {
      "symbol": "SVA",
      "name": "Sinovac Biotech, Ltd."
  },
  {
      "symbol": "SVBI",
      "name": "Severn Bancorp Inc"
  },
  {
      "symbol": "SVBL",
      "name": "Silver Bull Resources, Inc."
  },
  {
      "symbol": "SVM",
      "name": "Silvercorp Metals Inc"
  },
  {
      "symbol": "SVN",
      "name": "7 Days Group Holdings Limited"
  },
  {
      "symbol": "SVNT",
      "name": "Savient Pharmaceuticals Inc"
  },
  {
      "symbol": "SVT",
      "name": "Servotronics, Inc."
  },
  {
      "symbol": "SVU",
      "name": "SuperValu Inc."
  },
  {
      "symbol": "SVVC",
      "name": "Firsthand Technology Value Fund, Inc."
  },
  {
      "symbol": "SWC",
      "name": "Stillwater Mining Company"
  },
  {
      "symbol": "SWFT",
      "name": "Swift Transportation Company"
  },
  {
      "symbol": "SWHC",
      "name": "Smith & Wesson Holding Corporation"
  },
  {
      "symbol": "SWI",
      "name": "Solarwinds, Inc."
  },
  {
      "symbol": "SWIR",
      "name": "Sierra Wireless, Inc."
  },
  {
      "symbol": "SWK",
      "name": "Stanley Black & Decker, Inc."
  },
  {
      "symbol": "SWKS",
      "name": "Skyworks Solutions, Inc."
  },
  {
      "symbol": "SWM",
      "name": "Schweitzer-Mauduit International, Inc."
  },
  {
      "symbol": "SWN",
      "name": "Southwestern Energy Company"
  },
  {
      "symbol": "SWS",
      "name": "SWS Group, Inc."
  },
  {
      "symbol": "SWSH",
      "name": "Swisher Hygiene, Inc."
  },
  {
      "symbol": "SWU",
      "name": "Stanley Black & Decker, Inc."
  },
  {
      "symbol": "SWX",
      "name": "Southwest Gas Corporation"
  },
  {
      "symbol": "SWY",
      "name": "Safeway Inc."
  },
  {
      "symbol": "SWZ",
      "name": "Swiss Helvetia Fund, Inc. (The)"
  },
  {
      "symbol": "SXC",
      "name": "SunCoke Energy, Inc."
  },
  {
      "symbol": "SXCI",
      "name": "SXC Health Solutions Corp."
  },
  {
      "symbol": "SXI",
      "name": "Standex International Corporation"
  },
  {
      "symbol": "SXL",
      "name": "Sunoco Logistics Partners LP"
  },
  {
      "symbol": "SXT",
      "name": "Sensient Technologies Corporation"
  },
  {
      "symbol": "SYA",
      "name": "Symetra Financial Corporation"
  },
  {
      "symbol": "SYBT",
      "name": "S.Y. Bancorp, Inc."
  },
  {
      "symbol": "SYBTP",
      "name": "S.Y. Bancorp, Inc."
  },
  {
      "symbol": "SYK",
      "name": "Stryker Corporation"
  },
  {
      "symbol": "SYKE",
      "name": "Sykes Enterprises, Incorporated"
  },
  {
      "symbol": "SYMC",
      "name": "Symantec Corporation"
  },
  {
      "symbol": "SYMM",
      "name": "Symmetricom, Inc."
  },
  {
      "symbol": "SYMX",
      "name": "Synthesis Energy Systems, Inc."
  },
  {
      "symbol": "SYN",
      "name": "Synthetic Biologics, Inc"
  },
  {
      "symbol": "SYNA",
      "name": "Synaptics Incorporated"
  },
  {
      "symbol": "SYNC",
      "name": "Synacor, Inc."
  },
  {
      "symbol": "SYNL",
      "name": "Synalloy Corporation"
  },
  {
      "symbol": "SYNM",
      "name": "Syntroleum Corporation"
  },
  {
      "symbol": "SYNT",
      "name": "Syntel, Inc."
  },
  {
      "symbol": "SYPR",
      "name": "Sypris Solutions, Inc."
  },
  {
      "symbol": "SYRG",
      "name": "Synergy Resources Corporation"
  },
  {
      "symbol": "SYSW",
      "name": "SYSWIN Inc."
  },
  {
      "symbol": "SYT",
      "name": "Syngenta AG"
  },
  {
      "symbol": "SYUT",
      "name": "Synutra International, Inc."
  },
  {
      "symbol": "SYX",
      "name": "Systemax Inc."
  },
  {
      "symbol": "SYY",
      "name": "Sysco Corporation"
  },
  {
      "symbol": "SZYM",
      "name": "Solazyme, Inc."
  },
  {
      "symbol": "T",
      "name": "AT&T Inc."
  },
  {
      "symbol": "TA",
      "name": "TravelCenters of America LLC"
  },
  {
      "symbol": "TAC",
      "name": "TransAlta Corporation"
  },
  {
      "symbol": "TACT",
      "name": "TransAct Technologies Incorporated"
  },
  {
      "symbol": "TAI",
      "name": "Transamerica Income Shares, Inc."
  },
  {
      "symbol": "TAIT",
      "name": "Taitron Components Incorporated"
  },
  {
      "symbol": "TAL",
      "name": "TAL International Group, Inc."
  },
  {
      "symbol": "TAM",
      "name": "TAM S.A."
  },
  {
      "symbol": "TAOM",
      "name": "Taomee Holdings Limited"
  },
  {
      "symbol": "TAP",
      "name": "Molson Coors Brewing  Company"
  },
  {
      "symbol": "TAP/A",
      "name": "Molson Coors Brewing  Company"
  },
  {
      "symbol": "TARO",
      "name": "Taro Pharmaceutical Industries Ltd."
  },
  {
      "symbol": "TAS",
      "name": "Tasman Metals Ltd"
  },
  {
      "symbol": "TASR",
      "name": "TASER International, Inc."
  },
  {
      "symbol": "TAST",
      "name": "Carrols Restaurant Group, Inc."
  },
  {
      "symbol": "TAT",
      "name": "Transatlantic Petroleum Ltd"
  },
  {
      "symbol": "TATT",
      "name": "TAT Technologies Ltd."
  },
  {
      "symbol": "TAXI",
      "name": "Medallion Financial Corp."
  },
  {
      "symbol": "TAYC",
      "name": "Taylor Capital Group, Inc."
  },
  {
      "symbol": "TAYCP",
      "name": "Taylor Capital Group, Inc."
  },
  {
      "symbol": "TAYD",
      "name": "Taylor Devices, Inc."
  },
  {
      "symbol": "TBAC",
      "name": "Tandy Brands Accessories, Inc."
  },
  {
      "symbol": "TBBK",
      "name": "The Bancorp, Inc."
  },
  {
      "symbol": "TBI",
      "name": "TrueBlue, Inc."
  },
  {
      "symbol": "TBNK",
      "name": "Territorial Bancorp Inc."
  },
  {
      "symbol": "TBOW",
      "name": "Trunkbow International Holdings Ltd."
  },
  {
      "symbol": "TC",
      "name": "Thompson Creek Metals Company Inc."
  },
  {
      "symbol": "TCAP",
      "name": "Triangle Capital Corporation"
  },
  {
      "symbol": "TCB",
      "name": "TCF Financial Corporation"
  },
  {
      "symbol": "TCB/WS",
      "name": "TCF Financial Corporation"
  },
  {
      "symbol": "TCB^A",
      "name": "TCF Financial Corporation"
  },
  {
      "symbol": "TCBI",
      "name": "Texas Capital Bancshares, Inc."
  },
  {
      "symbol": "TCBIW",
      "name": "Texas Capital Bancshares, Inc."
  },
  {
      "symbol": "TCBK",
      "name": "TriCo Bancshares"
  },
  {
      "symbol": "TCC",
      "name": "Triangle Capital Corporation"
  },
  {
      "symbol": "TCCO",
      "name": "Technical Communications Corporation"
  },
  {
      "symbol": "TCHC",
      "name": "21st Century Holding Company"
  },
  {
      "symbol": "TCI",
      "name": "Transcontinental Realty Investors, Inc."
  },
  {
      "symbol": "TCK",
      "name": "Teck Resources Ltd"
  },
  {
      "symbol": "TCL",
      "name": "Tata Communications Limited"
  },
  {
      "symbol": "TCO",
      "name": "Taubman Centers, Inc."
  },
  {
      "symbol": "TCO^G",
      "name": "Taubman Centers, Inc."
  },
  {
      "symbol": "TCO^H",
      "name": "Taubman Centers, Inc."
  },
  {
      "symbol": "TCP",
      "name": "TC PipeLines, LP"
  },
  {
      "symbol": "TCPC",
      "name": "TCP Capital Corp."
  },
  {
      "symbol": "TCRD",
      "name": "THL Credit, Inc."
  },
  {
      "symbol": "TCX",
      "name": "Tucows Inc."
  },
  {
      "symbol": "TD",
      "name": "Toronto Dominion Bank (The)"
  },
  {
      "symbol": "TDC",
      "name": "Teradata Corporation"
  },
  {
      "symbol": "TDE",
      "name": "Telephone and Data Systems, Inc."
  },
  {
      "symbol": "TDF",
      "name": "Templeton Dragon Fund, Inc."
  },
  {
      "symbol": "TDG",
      "name": "Transdigm Group Incorporated"
  },
  {
      "symbol": "TDI",
      "name": "Telephone and Data Systems, Inc."
  },
  {
      "symbol": "TDJ",
      "name": "Telephone and Data Systems, Inc."
  },
  {
      "symbol": "TDS",
      "name": "Telephone and Data Systems, Inc."
  },
  {
      "symbol": "TDW",
      "name": "Tidewater Inc."
  },
  {
      "symbol": "TDY",
      "name": "Teledyne Technologies Incorporated"
  },
  {
      "symbol": "TE",
      "name": "TECO Energy, Inc."
  },
  {
      "symbol": "TEA",
      "name": "Teavana Holdings, Inc."
  },
  {
      "symbol": "TEAR",
      "name": "TearLab Corporation"
  },
  {
      "symbol": "TECD",
      "name": "Tech Data Corporation"
  },
  {
      "symbol": "TECH",
      "name": "Techne Corporation"
  },
  {
      "symbol": "TECUA",
      "name": "Tecumseh Products Company"
  },
  {
      "symbol": "TECUB",
      "name": "Tecumseh Products Company"
  },
  {
      "symbol": "TEF",
      "name": "Telefonica SA"
  },
  {
      "symbol": "TEG",
      "name": "Integrys Energy Group"
  },
  {
      "symbol": "TEI",
      "name": "Templeton Emerging Markets Income Fund, Inc."
  },
  {
      "symbol": "TEL",
      "name": "TE Connectivity Ltd."
  },
  {
      "symbol": "TELK",
      "name": "Telik, Inc."
  },
  {
      "symbol": "TEN",
      "name": "Tenneco Automotive, Inc."
  },
  {
      "symbol": "TEO",
      "name": "Telecom Argentina Stet - France Telecom S.A."
  },
  {
      "symbol": "TER",
      "name": "Teradyne, Inc."
  },
  {
      "symbol": "TESO",
      "name": "Tesco Corporation"
  },
  {
      "symbol": "TESS",
      "name": "TESSCO Technologies Incorporated"
  },
  {
      "symbol": "TEU",
      "name": "Box Ships Inc."
  },
  {
      "symbol": "TEVA",
      "name": "Teva Pharmaceutical Industries Limited"
  },
  {
      "symbol": "TEX",
      "name": "Terex Corporation"
  },
  {
      "symbol": "TF",
      "name": "Thai Capital Fund Inc"
  },
  {
      "symbol": "TFCO",
      "name": "Tufco Technologies, Inc."
  },
  {
      "symbol": "TFG",
      "name": "Goldman Sachs Group, Inc. (The)"
  },
  {
      "symbol": "TFM",
      "name": "The Fresh Market, Inc."
  },
  {
      "symbol": "TFSL",
      "name": "TFS Financial Corporation"
  },
  {
      "symbol": "TFX",
      "name": "Teleflex Incorporated"
  },
  {
      "symbol": "TG",
      "name": "Tredegar Corporation"
  },
  {
      "symbol": "TGA",
      "name": "Transglobe Energy Corp"
  },
  {
      "symbol": "TGAL",
      "name": "Tegal Corporation"
  },
  {
      "symbol": "TGB",
      "name": "Taseko Mines Limited"
  },
  {
      "symbol": "TGC",
      "name": "Tengasco, Inc."
  },
  {
      "symbol": "TGD",
      "name": "Timmons Gold Corp"
  },
  {
      "symbol": "TGE",
      "name": "TGC Industries, Inc."
  },
  {
      "symbol": "TGH",
      "name": "Textainer Group Holdings Limited"
  },
  {
      "symbol": "TGI",
      "name": "Triumph Group, Inc."
  },
  {
      "symbol": "TGP",
      "name": "Teekay LNG Partners L.P."
  },
  {
      "symbol": "TGS",
      "name": "Transportadora De Gas Sa Ord B"
  },
  {
      "symbol": "TGT",
      "name": "Target Corporation"
  },
  {
      "symbol": "TGX",
      "name": "Theragenics Corporation"
  },
  {
      "symbol": "THC",
      "name": "Tenet Healthcare Corporation"
  },
  {
      "symbol": "THER",
      "name": "Theratechnologies Inc."
  },
  {
      "symbol": "THFF",
      "name": "First Financial Corporation Indiana"
  },
  {
      "symbol": "THG",
      "name": "The Hanover Insurance Group, Inc."
  },
  {
      "symbol": "THI",
      "name": "Tim Hortons Inc."
  },
  {
      "symbol": "THLD",
      "name": "Threshold Pharmaceuticals, Inc."
  },
  {
      "symbol": "THM",
      "name": "International Tower Hill Mines Ltd"
  },
  {
      "symbol": "THO",
      "name": "Thor Industries, Inc."
  },
  {
      "symbol": "THOR",
      "name": "Thoratec Corporation"
  },
  {
      "symbol": "THQI",
      "name": "THQ Inc."
  },
  {
      "symbol": "THR",
      "name": "Thermon Group Holdings, Inc."
  },
  {
      "symbol": "THRD",
      "name": "TF Financial Corporation"
  },
  {
      "symbol": "THRX",
      "name": "Theravance, Inc."
  },
  {
      "symbol": "THS",
      "name": "Treehouse Foods, Inc."
  },
  {
      "symbol": "THTI",
      "name": "THT Heat Transfer Technology, Inc."
  },
  {
      "symbol": "TI",
      "name": "Telecom Italia S.P.A."
  },
  {
      "symbol": "TI/A",
      "name": "Telecom Italia S.P.A."
  },
  {
      "symbol": "TIBB",
      "name": "TIB Financial Corporation"
  },
  {
      "symbol": "TIBX",
      "name": "TIBCO Software, Inc."
  },
  {
      "symbol": "TICC",
      "name": "TICC Capital Corp."
  },
  {
      "symbol": "TIE",
      "name": "Titanium Metals Corporation"
  },
  {
      "symbol": "TIF",
      "name": "Tiffany & Co."
  },
  {
      "symbol": "TIGR",
      "name": "TigerLogic Corporation"
  },
  {
      "symbol": "TIII",
      "name": "Tii Network Technologies, Inc."
  },
  {
      "symbol": "TIK",
      "name": "Tel-Instrument Electronics Corp."
  },
  {
      "symbol": "TINY",
      "name": "Harris & Harris Group, Inc."
  },
  {
      "symbol": "TIS",
      "name": "Orchids Paper Products Company"
  },
  {
      "symbol": "TISA",
      "name": "Top Image Systems, Ltd."
  },
  {
      "symbol": "TISI",
      "name": "Team, Inc."
  },
  {
      "symbol": "TITN",
      "name": "Titan Machinery Inc."
  },
  {
      "symbol": "TIV",
      "name": "Tri-Valley Corporation"
  },
  {
      "symbol": "TIVO",
      "name": "TiVo Inc."
  },
  {
      "symbol": "TJX",
      "name": "TJX Companies, Inc. (The)"
  },
  {
      "symbol": "TK",
      "name": "Teekay Corporation"
  },
  {
      "symbol": "TKC",
      "name": "Turkcell Iletisim Hizmetleri AS"
  },
  {
      "symbol": "TKF",
      "name": "Turkish Investment Fund, Inc. (The)"
  },
  {
      "symbol": "TKMR",
      "name": "Tekmira Pharmaceuticals Corp"
  },
  {
      "symbol": "TKR",
      "name": "Timken Company (The)"
  },
  {
      "symbol": "TLAB",
      "name": "Tellabs, Inc."
  },
  {
      "symbol": "TLB",
      "name": "Talbots, Inc. (The)"
  },
  {
      "symbol": "TLB/WS",
      "name": "Talbots, Inc. (The)"
  },
  {
      "symbol": "TLF",
      "name": "Tandy Leather Factory, Inc."
  },
  {
      "symbol": "TLI",
      "name": "LMP Corporate Loan Fund Inc"
  },
  {
      "symbol": "TLK",
      "name": "P.T. Telekomunikasi Indonesia, Tbk."
  },
  {
      "symbol": "TLLP",
      "name": "Tesoro Logistics LP"
  },
  {
      "symbol": "TLM",
      "name": "Talisman Energy Inc."
  },
  {
      "symbol": "TLP",
      "name": "Transmontaigne Partners L.P."
  },
  {
      "symbol": "TLR",
      "name": "Timberline Resources Corporation"
  },
  {
      "symbol": "TM",
      "name": "Toyota Motor Corp Ltd Ord"
  },
  {
      "symbol": "TMH",
      "name": "Team Health Holdings, Inc."
  },
  {
      "symbol": "TMK",
      "name": "Torchmark Corporation"
  },
  {
      "symbol": "TMK^A",
      "name": "Torchmark Corporation"
  },
  {
      "symbol": "TMM",
      "name": "Grupo TMM, S.A."
  },
  {
      "symbol": "TMNG",
      "name": "The Management Network Group, Inc."
  },
  {
      "symbol": "TMO",
      "name": "Thermo Fisher Scientific Inc"
  },
  {
      "symbol": "TMP",
      "name": "Tompkins Financial Corporation"
  },
  {
      "symbol": "TMS",
      "name": "TMS International Corp."
  },
  {
      "symbol": "TNAV",
      "name": "TeleNav, Inc."
  },
  {
      "symbol": "TNB",
      "name": "Thomas & Betts Corporation"
  },
  {
      "symbol": "TNC",
      "name": "Tennant Company"
  },
  {
      "symbol": "TNGN",
      "name": "Tengion, Inc."
  },
  {
      "symbol": "TNGO",
      "name": "Tangoe, Inc."
  },
  {
      "symbol": "TNH",
      "name": "Terra Nitrogen Company, L.P."
  },
  {
      "symbol": "TNK",
      "name": "Teekay Tankers Ltd."
  },
  {
      "symbol": "TNP",
      "name": "Tsakos Energy Navigation Ltd"
  },
  {
      "symbol": "TNS",
      "name": "TNS, Inc."
  },
  {
      "symbol": "TOF",
      "name": "Tofutti Brands Inc."
  },
  {
      "symbol": "TOFC",
      "name": "Tower Financial Corporation"
  },
  {
      "symbol": "TOL",
      "name": "Toll Brothers Inc."
  },
  {
      "symbol": "TOO",
      "name": "Teekay Offshore Partners L.P."
  },
  {
      "symbol": "TOPS",
      "name": "TOP Ships Inc."
  },
  {
      "symbol": "TORM          ",
      "name": "TOR Minerals International Inc"
  },
  {
      "symbol": "TOT",
      "name": "TotalFinaElf, S.A."
  },
  {
      "symbol": "TOWN",
      "name": "Towne Bank"
  },
  {
      "symbol": "TOWR",
      "name": "Tower International, Inc."
  },
  {
      "symbol": "TPC",
      "name": "Tutor Perini Corporation"
  },
  {
      "symbol": "TPCG",
      "name": "TPC Group, Inc."
  },
  {
      "symbol": "TPGI",
      "name": "Thomas Properties Group, Inc."
  },
  {
      "symbol": "TPI",
      "name": "Tianyin Pharmaceutical Co., Inc."
  },
  {
      "symbol": "TPL",
      "name": "Texas Pacific Land Trust"
  },
  {
      "symbol": "TPLM",
      "name": "Triangle Petroleum Corporation"
  },
  {
      "symbol": "TPX",
      "name": "Tempur-pedic International Inc"
  },
  {
      "symbol": "TPZ",
      "name": "Tortoise Power and Energy Infrastructure Fund, Inc"
  },
  {
      "symbol": "TQNT",
      "name": "TriQuint Semiconductor, Inc."
  },
  {
      "symbol": "TQQQ",
      "name": "ProShares UltraPro QQQ"
  },
  {
      "symbol": "TR",
      "name": "Tootsie Roll Industries, Inc."
  },
  {
      "symbol": "TRAK",
      "name": "DealerTrack Holdings, Inc."
  },
  {
      "symbol": "TRC",
      "name": "Tejon Ranch Co"
  },
  {
      "symbol": "TREE",
      "name": "Tree.com, Inc."
  },
  {
      "symbol": "TREX",
      "name": "Trex Company, Inc."
  },
  {
      "symbol": "TRF",
      "name": "Templeton Russia Fund, Inc."
  },
  {
      "symbol": "TRGP",
      "name": "Targa Resources, Inc."
  },
  {
      "symbol": "TRGT",
      "name": "Targacept, Inc."
  },
  {
      "symbol": "TRI",
      "name": "Thomson Reuters Corp"
  },
  {
      "symbol": "TRIB",
      "name": "Trinity Biotech plc"
  },
  {
      "symbol": "TRIO",
      "name": "Trio Merger Corp."
  },
  {
      "symbol": "TRIP",
      "name": "TripAdvisor, Inc."
  },
  {
      "symbol": "TRIT",
      "name": "Tri-Tech Holding Inc."
  },
  {
      "symbol": "TRK",
      "name": "Speedway Motorsports, Inc."
  },
  {
      "symbol": "TRLG",
      "name": "True Religion Apparel, Inc."
  },
  {
      "symbol": "TRMB",
      "name": "Trimble Navigation Limited"
  },
  {
      "symbol": "TRMD",
      "name": "TORM A/S"
  },
  {
      "symbol": "TRMK",
      "name": "Trustmark Corporation"
  },
  {
      "symbol": "TRN",
      "name": "Trinity Industries, Inc."
  },
  {
      "symbol": "TRNO",
      "name": "Terreno Realty Corporation"
  },
  {
      "symbol": "TRNS",
      "name": "Transcat, Inc."
  },
  {
      "symbol": "TRNX",
      "name": "Tornier N.V."
  },
  {
      "symbol": "TROW",
      "name": "T. Rowe Price Group, Inc."
  },
  {
      "symbol": "TRP",
      "name": "Transcanada Pipelines, Ltd."
  },
  {
      "symbol": "TRR",
      "name": "TRC Companies, Inc."
  },
  {
      "symbol": "TRS",
      "name": "TriMas Corporation"
  },
  {
      "symbol": "TRST",
      "name": "TrustCo Bank Corp NY"
  },
  {
      "symbol": "TRT",
      "name": "Trio-Tech International"
  },
  {
      "symbol": "TRU",
      "name": "Torch Energy Royalty Trust"
  },
  {
      "symbol": "TRV",
      "name": "The Travelers Companies, Inc."
  },
  {
      "symbol": "TRW",
      "name": "TRW Automotive Holdings Corporation"
  },
  {
      "symbol": "TRX",
      "name": "Tanzanian Royalty Exploration Corporation"
  },
  {
      "symbol": "TS",
      "name": "Tenaris S.A."
  },
  {
      "symbol": "TSBK",
      "name": "Timberland Bancorp, Inc."
  },
  {
      "symbol": "TSCO",
      "name": "Tractor Supply Company"
  },
  {
      "symbol": "TSEM",
      "name": "Tower Semiconductor Ltd."
  },
  {
      "symbol": "TSH",
      "name": "Teche Holding Company"
  },
  {
      "symbol": "TSI",
      "name": "TCW Strategic Income Fund, Inc."
  },
  {
      "symbol": "TSL",
      "name": "Trina Solar Limited"
  },
  {
      "symbol": "TSLA",
      "name": "Tesla Motors, Inc."
  },
  {
      "symbol": "TSM",
      "name": "Taiwan Semiconductor Manufacturing Company Limited"
  },
  {
      "symbol": "TSN",
      "name": "Tyson Foods, Inc."
  },
  {
      "symbol": "TSO",
      "name": "Tesoro Petroleum Corporation"
  },
  {
      "symbol": "TSON",
      "name": "TranS1 Inc."
  },
  {
      "symbol": "TSPT",
      "name": "Transcept Pharmaceuticals, Inc."
  },
  {
      "symbol": "TSRA",
      "name": "Tessera Technologies, Inc."
  },
  {
      "symbol": "TSRI",
      "name": "TSR, Inc."
  },
  {
      "symbol": "TSRX",
      "name": "Trius Therapeutics, Inc."
  },
  {
      "symbol": "TSS",
      "name": "Total System Services, Inc."
  },
  {
      "symbol": "TST",
      "name": "TheStreet, Inc."
  },
  {
      "symbol": "TSTC",
      "name": "Telestone Technologies Corp."
  },
  {
      "symbol": "TSTF",
      "name": "TeamStaff, Inc."
  },
  {
      "symbol": "TSU",
      "name": "Tele Celular Sul Participacoes S.A."
  },
  {
      "symbol": "TSYS",
      "name": "TeleCommunication Systems, Inc."
  },
  {
      "symbol": "TTC",
      "name": "Toro Company (The)"
  },
  {
      "symbol": "TTEC",
      "name": "TeleTech Holdings, Inc."
  },
  {
      "symbol": "TTEK",
      "name": "Tetra Tech, Inc."
  },
  {
      "symbol": "TTF",
      "name": "Thai Fund, Inc. (The)"
  },
  {
      "symbol": "TTGT",
      "name": "TechTarget, Inc."
  },
  {
      "symbol": "TTHI",
      "name": "Transition Therapeutics, Inc."
  },
  {
      "symbol": "TTI",
      "name": "Tetra Technologies, Inc."
  },
  {
      "symbol": "TTM",
      "name": "Tata Motors Ltd"
  },
  {
      "symbol": "TTMI",
      "name": "TTM Technologies, Inc."
  },
  {
      "symbol": "TTO",
      "name": "Tortoise Capital Resources Corporation"
  },
  {
      "symbol": "TTP",
      "name": "Tortoise Pipeline & Energy Fund, Inc."
  },
  {
      "symbol": "TTTM",
      "name": "T3 Motion Inc"
  },
  {
      "symbol": "TTTM/WS/W",
      "name": "T3 Motion Inc"
  },
  {
      "symbol": "TTTM/WS/Z",
      "name": "T3 Motion Inc"
  },
  {
      "symbol": "TTWO",
      "name": "Take-Two Interactive Software, Inc."
  },
  {
      "symbol": "TU",
      "name": "TELUS Corporation"
  },
  {
      "symbol": "TUC",
      "name": "Mac-Gray Corporation"
  },
  {
      "symbol": "TUDO",
      "name": "Tudou Holdings Limited"
  },
  {
      "symbol": "TUES",
      "name": "Tuesday Morning Corp."
  },
  {
      "symbol": "TUMI",
      "name": "Tumi Holdings, Inc."
  },
  {
      "symbol": "TUP",
      "name": "Tupperware Corporation"
  },
  {
      "symbol": "TV",
      "name": "Grupo Televisa S.A."
  },
  {
      "symbol": "TVC",
      "name": "Tennessee Valley Authority"
  },
  {
      "symbol": "TVE",
      "name": "Tennessee Valley Authority"
  },
  {
      "symbol": "TVL",
      "name": "LIN TV Corp"
  },
  {
      "symbol": "TW",
      "name": "Towers Watson & Co"
  },
  {
      "symbol": "TWC",
      "name": "Time Warner Cable Inc"
  },
  {
      "symbol": "TWER",
      "name": "Towerstream Corporation"
  },
  {
      "symbol": "TWGP",
      "name": "Tower Group, Inc."
  },
  {
      "symbol": "TWI",
      "name": "Titan International, Inc."
  },
  {
      "symbol": "TWIN",
      "name": "Twin Disc, Incorporated"
  },
  {
      "symbol": "TWMC",
      "name": "Trans World Entertainment Corp."
  },
  {
      "symbol": "TWN",
      "name": "Taiwan Fund, Inc. (The)"
  },
  {
      "symbol": "TWO",
      "name": "Two Harbors Investments Corp"
  },
  {
      "symbol": "TWO/WS",
      "name": "Two Harbors Investments Corp"
  },
  {
      "symbol": "TWTC",
      "name": "tw telecom inc."
  },
  {
      "symbol": "TWX",
      "name": "Time Warner Inc."
  },
  {
      "symbol": "TX",
      "name": "Ternium S.A."
  },
  {
      "symbol": "TXCC",
      "name": "TranSwitch Corporation"
  },
  {
      "symbol": "TXI",
      "name": "Texas Industries, Inc."
  },
  {
      "symbol": "TXN",
      "name": "Texas Instruments Incorporated"
  },
  {
      "symbol": "TXRH",
      "name": "Texas Roadhouse, Inc."
  },
  {
      "symbol": "TXT",
      "name": "Textron Inc."
  },
  {
      "symbol": "TY",
      "name": "Tri Continental Corporation"
  },
  {
      "symbol": "TY^",
      "name": "Tri Continental Corporation"
  },
  {
      "symbol": "TYC",
      "name": "Tyco International, Ltd. (Switzerland)"
  },
  {
      "symbol": "TYG",
      "name": "Tortoise Energy Infrastructure Corporation"
  },
  {
      "symbol": "TYG^A",
      "name": "Tortoise Energy Infrastructure Corporation"
  },
  {
      "symbol": "TYL",
      "name": "Tyler Technologies, Inc."
  },
  {
      "symbol": "TYN",
      "name": "Tortoise North American Energy Corporation"
  },
  {
      "symbol": "TYPE",
      "name": "Monotype Imaging Holdings Inc."
  },
  {
      "symbol": "TYY",
      "name": "Tortoise Energy Capital Corporation"
  },
  {
      "symbol": "TYY^B/CL",
      "name": "Tortoise Energy Capital Corporation"
  },
  {
      "symbol": "TYY^C",
      "name": "Tortoise Energy Capital Corporation"
  },
  {
      "symbol": "TZF",
      "name": "Bear Stearns Depositor, Inc."
  },
  {
      "symbol": "TZK",
      "name": "Trust Ctfs 2002 1 Bear Stearns Depositor Inc Acting as Deposit"
  },
  {
      "symbol": "TZOO",
      "name": "Travelzoo Inc"
  },
  {
      "symbol": "TZYM",
      "name": "Tranzyme, Inc."
  },
  {
      "symbol": "UA",
      "name": "Under Armour, Inc."
  },
  {
      "symbol": "UACL",
      "name": "Universal Truckload Services, Inc."
  },
  {
      "symbol": "UAL",
      "name": "United Continental Holdings, Inc."
  },
  {
      "symbol": "UAM",
      "name": "Universal American Corp."
  },
  {
      "symbol": "UAN",
      "name": "CVR Partners, LP"
  },
  {
      "symbol": "UBA",
      "name": "Urstadt Biddle Properties Inc."
  },
  {
      "symbol": "UBCP",
      "name": "United Bancorp, Inc."
  },
  {
      "symbol": "UBFO",
      "name": "United Security Bancshares"
  },
  {
      "symbol": "UBNK",
      "name": "United Financial Bancorp, Inc."
  },
  {
      "symbol": "UBNT",
      "name": "Ubiquiti Networks, Inc."
  },
  {
      "symbol": "UBOH",
      "name": "United Bancshares, Inc."
  },
  {
      "symbol": "UBP",
      "name": "Urstadt Biddle Properties Inc."
  },
  {
      "symbol": "UBP^C",
      "name": "Urstadt Biddle Properties Inc."
  },
  {
      "symbol": "UBP^D",
      "name": "Urstadt Biddle Properties Inc."
  },
  {
      "symbol": "UBPS",
      "name": "Universal Business Payment Solutions Acquisition Corporation"
  },
  {
      "symbol": "UBPSU",
      "name": "Universal Business Payment Solutions Acquisition Corporation"
  },
  {
      "symbol": "UBPSW",
      "name": "Universal Business Payment Solutions Acquisition Corporation"
  },
  {
      "symbol": "UBS",
      "name": "UBS AG"
  },
  {
      "symbol": "UBS^D",
      "name": "UBS AG"
  },
  {
      "symbol": "UBSH",
      "name": "Union First Market Bankshares Corporation"
  },
  {
      "symbol": "UBSI",
      "name": "United Bankshares, Inc."
  },
  {
      "symbol": "UCBA",
      "name": "United Community Bancorp"
  },
  {
      "symbol": "UCBI",
      "name": "United Community Banks, Inc."
  },
  {
      "symbol": "UCFC",
      "name": "United Community Financial Corp."
  },
  {
      "symbol": "UCTT",
      "name": "Ultra Clean Holdings, Inc."
  },
  {
      "symbol": "UDR",
      "name": "United Dominion Realty Trust, Inc."
  },
  {
      "symbol": "UDR^G/CL",
      "name": "United Dominion Realty Trust, Inc."
  },
  {
      "symbol": "UDRL",
      "name": "Union Drilling, Inc."
  },
  {
      "symbol": "UEC",
      "name": "Uranium Energy Corp."
  },
  {
      "symbol": "UEIC",
      "name": "Universal Electronics Inc."
  },
  {
      "symbol": "UEPS",
      "name": "Net 1 UEPS Technologies, Inc."
  },
  {
      "symbol": "UFCS",
      "name": "United Fire Group, Inc"
  },
  {
      "symbol": "UFI",
      "name": "Unifi, Inc."
  },
  {
      "symbol": "UFPI",
      "name": "Universal Forest Products, Inc."
  },
  {
      "symbol": "UFPT",
      "name": "UFP Technologies, Inc."
  },
  {
      "symbol": "UFS",
      "name": "Domtar Corporation"
  },
  {
      "symbol": "UG",
      "name": "United-Guardian, Inc."
  },
  {
      "symbol": "UGI",
      "name": "UGI Corporation"
  },
  {
      "symbol": "UGP",
      "name": "Ultrapar Participacoes S.A."
  },
  {
      "symbol": "UHAL",
      "name": "Amerco"
  },
  {
      "symbol": "UHS",
      "name": "Universal Health Services, Inc."
  },
  {
      "symbol": "UHT",
      "name": "Universal Health Realty Income Trust"
  },
  {
      "symbol": "UIL",
      "name": "UIL Holdings Corporation"
  },
  {
      "symbol": "UIS",
      "name": "Unisys Corporation"
  },
  {
      "symbol": "UIS^A",
      "name": "Unisys Corporation"
  },
  {
      "symbol": "UL",
      "name": "Unilever PLC"
  },
  {
      "symbol": "ULBI",
      "name": "Ultralife Corporation"
  },
  {
      "symbol": "ULGX",
      "name": "Urologix, Inc."
  },
  {
      "symbol": "ULTA",
      "name": "Ulta Salon, Cosmetics & Fragrance, Inc."
  },
  {
      "symbol": "ULTI",
      "name": "The Ultimate Software Group, Inc."
  },
  {
      "symbol": "ULTR",
      "name": "Ultrapetrol (Bahamas) Limited"
  },
  {
      "symbol": "UMBF",
      "name": "UMB Financial Corporation"
  },
  {
      "symbol": "UMC",
      "name": "United Microelectronics Corporation"
  },
  {
      "symbol": "UMH",
      "name": "UMH Properties, Inc."
  },
  {
      "symbol": "UMH^A",
      "name": "UMH Properties, Inc."
  },
  {
      "symbol": "UMPQ",
      "name": "Umpqua Holdings Corporation"
  },
  {
      "symbol": "UN",
      "name": "Unilever NV"
  },
  {
      "symbol": "UNAM",
      "name": "Unico American Corporation"
  },
  {
      "symbol": "UNB",
      "name": "Union Bankshares, Inc."
  },
  {
      "symbol": "UNF",
      "name": "Unifirst Corporation"
  },
  {
      "symbol": "UNFI",
      "name": "United Natural Foods, Inc."
  },
  {
      "symbol": "UNH",
      "name": "UnitedHealth Group Incorporated"
  },
  {
      "symbol": "UNIS",
      "name": "Unilife Corporation"
  },
  {
      "symbol": "UNM",
      "name": "Unum Group"
  },
  {
      "symbol": "UNP",
      "name": "Union Pacific Corporation"
  },
  {
      "symbol": "UNS",
      "name": "UniSource Energy Corporation"
  },
  {
      "symbol": "UNT",
      "name": "Unit Corporation"
  },
  {
      "symbol": "UNTD",
      "name": "United Online, Inc."
  },
  {
      "symbol": "UNTK",
      "name": "UniTek Global Services, Inc."
  },
  {
      "symbol": "UNTY",
      "name": "Unity Bancorp, Inc."
  },
  {
      "symbol": "UNXL",
      "name": "Uni-Pixel, Inc."
  },
  {
      "symbol": "UPG",
      "name": "Universal Power Group Inc"
  },
  {
      "symbol": "UPI",
      "name": "Uroplasty, Inc."
  },
  {
      "symbol": "UPL",
      "name": "Ultra Petroleum Corp."
  },
  {
      "symbol": "UPS",
      "name": "United Parcel Service, Inc."
  },
  {
      "symbol": "UQM",
      "name": "UQM TECHNOLOGIES INC"
  },
  {
      "symbol": "URBN",
      "name": "Urban Outfitters, Inc."
  },
  {
      "symbol": "URG",
      "name": "Ur Energy Inc"
  },
  {
      "symbol": "URI",
      "name": "United Rentals, Inc."
  },
  {
      "symbol": "URRE",
      "name": "Uranium Resources, Inc."
  },
  {
      "symbol": "URS",
      "name": "URS Corporation"
  },
  {
      "symbol": "URZ",
      "name": "Uranerz Energy Corporation"
  },
  {
      "symbol": "USA",
      "name": "Liberty All-Star Equity Fund"
  },
  {
      "symbol": "USAK",
      "name": "USA Truck, Inc."
  },
  {
      "symbol": "USAP",
      "name": "Universal Stainless & Alloy Products, Inc."
  },
  {
      "symbol": "USAT",
      "name": "USA Technologies, Inc."
  },
  {
      "symbol": "USATP",
      "name": "USA Technologies, Inc."
  },
  {
      "symbol": "USATZ",
      "name": "USA Technologies, Inc."
  },
  {
      "symbol": "USB",
      "name": "U.S. Bancorp"
  },
  {
      "symbol": "USB^A",
      "name": "U.S. Bancorp"
  },
  {
      "symbol": "USB^H",
      "name": "U.S. Bancorp"
  },
  {
      "symbol": "USB^J/CL",
      "name": "U.S. Bancorp"
  },
  {
      "symbol": "USB^K/CL",
      "name": "U.S. Bancorp"
  },
  {
      "symbol": "USB^L",
      "name": "U.S. Bancorp"
  },
  {
      "symbol": "USB^M",
      "name": "U.S. Bancorp"
  },
  {
      "symbol": "USB^N",
      "name": "US Bancorp Del"
  },
  {
      "symbol": "USBI",
      "name": "United Security Bancshares, Inc."
  },
  {
      "symbol": "USCR",
      "name": "U S Concrete, Inc."
  },
  {
      "symbol": "USEG",
      "name": "U.S. Energy Corp."
  },
  {
      "symbol": "USG",
      "name": "USG Corporation"
  },
  {
      "symbol": "USHS",
      "name": "U.S. Home Systems, Inc."
  },
  {
      "symbol": "USLM",
      "name": "United States Lime & Minerals, Inc."
  },
  {
      "symbol": "USM",
      "name": "United States Cellular Corporation"
  },
  {
      "symbol": "USMO",
      "name": "USA Mobility, Inc."
  },
  {
      "symbol": "USNA",
      "name": "USANA Health Sciences, Inc."
  },
  {
      "symbol": "USPH",
      "name": "U.S. Physical Therapy, Inc."
  },
  {
      "symbol": "USTR",
      "name": "United Stationers Inc."
  },
  {
      "symbol": "USU",
      "name": "USEC Inc."
  },
  {
      "symbol": "UTA",
      "name": "Universal Travel Group"
  },
  {
      "symbol": "UTEK",
      "name": "Ultratech, Inc."
  },
  {
      "symbol": "UTF",
      "name": "Cohen & Steers Infrastructure Fund, Inc"
  },
  {
      "symbol": "UTG",
      "name": "Reaves Utility Income Fund"
  },
  {
      "symbol": "UTHR",
      "name": "United Therapeutics Corporation"
  },
  {
      "symbol": "UTI",
      "name": "Universal Technical Institute Inc"
  },
  {
      "symbol": "UTIW",
      "name": "UTi Worldwide Inc."
  },
  {
      "symbol": "UTL",
      "name": "UNITIL Corporation"
  },
  {
      "symbol": "UTMD",
      "name": "Utah Medical Products, Inc."
  },
  {
      "symbol": "UTSI",
      "name": "UTStarcom Holdings Corp"
  },
  {
      "symbol": "UTX",
      "name": "United Technologies Corporation"
  },
  {
      "symbol": "UUU",
      "name": "Universal Security Instruments, Inc."
  },
  {
      "symbol": "UVE",
      "name": "UNIVERSAL INSURANCE HOLDINGS INC"
  },
  {
      "symbol": "UVSP",
      "name": "Univest Corporation of Pennsylvania"
  },
  {
      "symbol": "UVV",
      "name": "Universal Corporation"
  },
  {
      "symbol": "UWN",
      "name": "Nevada Gold & Casinos, Inc."
  },
  {
      "symbol": "UZA",
      "name": "United States Cellular Corporation"
  },
  {
      "symbol": "V",
      "name": "Visa Inc."
  },
  {
      "symbol": "VAC",
      "name": "Marriot Vacations Worldwide Corporation"
  },
  {
      "symbol": "VAL",
      "name": "Valspar Corporation (The)"
  },
  {
      "symbol": "VALE",
      "name": "VALE S.A."
  },
  {
      "symbol": "VALE/P",
      "name": "VALE S.A."
  },
  {
      "symbol": "VALU",
      "name": "Value Line, Inc."
  },
  {
      "symbol": "VALV",
      "name": "Shengkai Innovations, Inc."
  },
  {
      "symbol": "VAR",
      "name": "Varian Medical Systems, Inc."
  },
  {
      "symbol": "VASC",
      "name": "Vascular Solutions, Inc."
  },
  {
      "symbol": "VBF",
      "name": "Invesco Van Kampen Bond Fund"
  },
  {
      "symbol": "VBFC",
      "name": "Village Bank and Trust Financial Corp."
  },
  {
      "symbol": "VC",
      "name": "Visteon Corporation"
  },
  {
      "symbol": "VCBI",
      "name": "Virginia Commerce Bancorp"
  },
  {
      "symbol": "VCF",
      "name": "Delaware Investments Colorado Municipal Income Fund, Inc"
  },
  {
      "symbol": "VCI",
      "name": "Valassis Communications, Inc."
  },
  {
      "symbol": "VCIT",
      "name": "Vanguard Intermediate-Term Corporate Bond ETF"
  },
  {
      "symbol": "VCLK",
      "name": "ValueClick, Inc."
  },
  {
      "symbol": "VCLT",
      "name": "Vanguard Long-Term Corporate Bond ETF"
  },
  {
      "symbol": "VCO",
      "name": "Vina Concha Y Toro"
  },
  {
      "symbol": "VCRA",
      "name": "Vocera Communications, Inc."
  },
  {
      "symbol": "VCSH",
      "name": "Vanguard Short-Term Corporate Bond ETF"
  },
  {
      "symbol": "VCV",
      "name": "Invesco Van Kampen California Value Municipal Income Trust"
  },
  {
      "symbol": "VDSI",
      "name": "VASCO Data Security International, Inc."
  },
  {
      "symbol": "VE",
      "name": "Veolia Environnement"
  },
  {
      "symbol": "VECO",
      "name": "Veeco Instruments Inc."
  },
  {
      "symbol": "VEL^E",
      "name": "Virginia Electric & Power Company"
  },
  {
      "symbol": "VELT",
      "name": "Velti plc"
  },
  {
      "symbol": "VFC",
      "name": "V.F. Corporation"
  },
  {
      "symbol": "VFL",
      "name": "Delaware Investments Florida Insured Municipal Income Fund"
  },
  {
      "symbol": "VG",
      "name": "Vonage Holdings Corp."
  },
  {
      "symbol": "VGI",
      "name": "Virtus Global Multi-Sector Income Fund"
  },
  {
      "symbol": "VGIT",
      "name": "Vanguard Intermediate -Term Government Bond ETF"
  },
  {
      "symbol": "VGLT",
      "name": "Vanguard Long-Term Government Bond ETF"
  },
  {
      "symbol": "VGM",
      "name": "Invesco Van Kampen Trust for Investment Grade Municipals"
  },
  {
      "symbol": "VGR",
      "name": "Vector Group Ltd."
  },
  {
      "symbol": "VGSH",
      "name": "Vanguard Short Term Government Bond ETF"
  },
  {
      "symbol": "VGZ",
      "name": "Vista Gold Corporation"
  },
  {
      "symbol": "VHC",
      "name": "VirnetX Holding Corp"
  },
  {
      "symbol": "VHI",
      "name": "Valhi, Inc."
  },
  {
      "symbol": "VHS",
      "name": "Vanguard Health Systems, Inc."
  },
  {
      "symbol": "VIA",
      "name": "Viacom Inc."
  },
  {
      "symbol": "VIAB",
      "name": "Viacom Inc."
  },
  {
      "symbol": "VIAS",
      "name": "Viasystems Group, Inc."
  },
  {
      "symbol": "VICL",
      "name": "Vical Incorporated"
  },
  {
      "symbol": "VICR",
      "name": "Vicor Corporation"
  },
  {
      "symbol": "VIDE",
      "name": "Video Display Corporation"
  },
  {
      "symbol": "VIFL",
      "name": "Food Technology Service, Inc."
  },
  {
      "symbol": "VII",
      "name": "Vicon Industries, Inc."
  },
  {
      "symbol": "VIM",
      "name": "Invesco Van Kampen Trust for Value Municipals"
  },
  {
      "symbol": "VIMC",
      "name": "Vimicro International Corporation"
  },
  {
      "symbol": "VIP",
      "name": "Open Joint Stock Company &quot;Vimpel-Communications&quot;"
  },
  {
      "symbol": "VIPS",
      "name": "Vipshop Holdings Limited"
  },
  {
      "symbol": "VIRC",
      "name": "Virco Manufacturing Corporation"
  },
  {
      "symbol": "VISN",
      "name": "VisionChina Media, Inc."
  },
  {
      "symbol": "VIST",
      "name": "VIST Financial Corp"
  },
  {
      "symbol": "VIT",
      "name": "Vanceinfo Technologies Inc"
  },
  {
      "symbol": "VITC",
      "name": "Vitacost.com, Inc."
  },
  {
      "symbol": "VIV",
      "name": "Telefonica Brasil S.A."
  },
  {
      "symbol": "VIVO",
      "name": "Meridian Bioscience Inc."
  },
  {
      "symbol": "VKI",
      "name": "Invesco Van Kampen Advantage Municipal Income Trust II"
  },
  {
      "symbol": "VKL",
      "name": "Invesco Van Kampen Select Sector Municipal Trust"
  },
  {
      "symbol": "VKQ",
      "name": "Invesco Van Kampen Municipal Trust"
  },
  {
      "symbol": "VLCCF",
      "name": "Knightsbridge Tankers Limited"
  },
  {
      "symbol": "VLGEA",
      "name": "Village Super Market, Inc."
  },
  {
      "symbol": "VLNC",
      "name": "Valence Technology, Inc."
  },
  {
      "symbol": "VLO",
      "name": "Valero Energy Corporation"
  },
  {
      "symbol": "VLT",
      "name": "Invesco Van Kampen High Income Corporate Bond Fund"
  },
  {
      "symbol": "VLTR",
      "name": "Volterra Semiconductor Corporation"
  },
  {
      "symbol": "VLY",
      "name": "Valley National Bancorp"
  },
  {
      "symbol": "VLY/WS",
      "name": "Valley National Bancorp"
  },
  {
      "symbol": "VLY^A",
      "name": "Valley National Bancorp"
  },
  {
      "symbol": "VLYWW",
      "name": "Valley National Bancorp"
  },
  {
      "symbol": "VMBS",
      "name": "Vanguard Mortgage-Backed Securities ETF"
  },
  {
      "symbol": "VMC",
      "name": "Vulcan Materials Company"
  },
  {
      "symbol": "VMED",
      "name": "Virgin Media Inc."
  },
  {
      "symbol": "VMI",
      "name": "Valmont Industries, Inc."
  },
  {
      "symbol": "VMM",
      "name": "Delaware Investments Minnesota Municipal Income Fund II, Inc."
  },
  {
      "symbol": "VMO",
      "name": "Invesco Van Kampen Municipal Opportunity Trust"
  },
  {
      "symbol": "VMV",
      "name": "Invesco Van Kampen Massachusetts Value Municipal Income Trust"
  },
  {
      "symbol": "VMW",
      "name": "Vmware, Inc."
  },
  {
      "symbol": "VNDA",
      "name": "Vanda Pharmaceuticals Inc."
  },
  {
      "symbol": "VNET",
      "name": "21Vianet Group, Inc."
  },
  {
      "symbol": "VNO",
      "name": "Vornado Realty Trust"
  },
  {
      "symbol": "VNO^A",
      "name": "Vornado Realty Trust"
  },
  {
      "symbol": "VNO^E",
      "name": "Vornado Realty Trust"
  },
  {
      "symbol": "VNO^F",
      "name": "Vornado Realty Trust"
  },
  {
      "symbol": "VNO^G",
      "name": "Vornado Realty Trust"
  },
  {
      "symbol": "VNO^H",
      "name": "Vornado Realty Trust"
  },
  {
      "symbol": "VNO^I",
      "name": "Vornado Realty Trust"
  },
  {
      "symbol": "VNO^J",
      "name": "Vornado Realty Trust"
  },
  {
      "symbol": "VNOD",
      "name": "Vornado Realty L.P."
  },
  {
      "symbol": "VNQI",
      "name": "Vanguard International Equity Index Funds Vanguard Global ex-U"
  },
  {
      "symbol": "VNR",
      "name": "Vanguard Natural Resources LLC"
  },
  {
      "symbol": "VNTV",
      "name": "Vantiv, Inc."
  },
  {
      "symbol": "VOC",
      "name": "VOC Energy Trust"
  },
  {
      "symbol": "VOCS",
      "name": "Vocus, Inc."
  },
  {
      "symbol": "VOD",
      "name": "Vodafone Group Plc"
  },
  {
      "symbol": "VOG",
      "name": "Voyager Oil & Gas, Inc."
  },
  {
      "symbol": "VOLC",
      "name": "Volcano Corporation"
  },
  {
      "symbol": "VONE",
      "name": "Vanguard Scottsdale Funds Vanguard Russell 1000 ETF"
  },
  {
      "symbol": "VONG",
      "name": "Vanguard Scottsdale Funds Vanguard Russell 1000 Growth ETF"
  },
  {
      "symbol": "VONV",
      "name": "Vanguard Scottsdale Funds Vanguard Russell 1000 Value ETF"
  },
  {
      "symbol": "VOQ",
      "name": "Invesco Van Kampen Ohio Quality Municipal Trust"
  },
  {
      "symbol": "VOXX",
      "name": "VOXX International Corporation"
  },
  {
      "symbol": "VPFG",
      "name": "ViewPoint Financial Group, Inc."
  },
  {
      "symbol": "VPG",
      "name": "Vishay Precision Group, Inc."
  },
  {
      "symbol": "VPHM",
      "name": "ViroPharma Incorporated"
  },
  {
      "symbol": "VPRT",
      "name": "Vistaprint N.V."
  },
  {
      "symbol": "VPV",
      "name": "Invesco Van Kampen Pennsylvania Value Municipal Income Trust"
  },
  {
      "symbol": "VQ",
      "name": "Venoco, Inc."
  },
  {
      "symbol": "VR",
      "name": "Validus Holdings, Ltd."
  },
  {
      "symbol": "VRA",
      "name": "Vera Bradley, Inc."
  },
  {
      "symbol": "VRML",
      "name": "Vermillion, Inc."
  },
  {
      "symbol": "VRNG",
      "name": "Vringo, Inc."
  },
  {
      "symbol": "VRNG/WS",
      "name": "Vringo, Inc."
  },
  {
      "symbol": "VRNM",
      "name": "Verenium Corporation"
  },
  {
      "symbol": "VRNT",
      "name": "Verint Systems Inc."
  },
  {
      "symbol": "VRS",
      "name": "Verso Paper Corp."
  },
  {
      "symbol": "VRSK",
      "name": "Verisk Analytics, Inc."
  },
  {
      "symbol": "VRSN",
      "name": "VeriSign, Inc."
  },
  {
      "symbol": "VRTA",
      "name": "Vestin Realty Mortgage I, Inc."
  },
  {
      "symbol": "VRTB",
      "name": "Vestin Realty Mortgage II, Inc."
  },
  {
      "symbol": "VRTS",
      "name": "Virtus Investment Partners, Inc."
  },
  {
      "symbol": "VRTU",
      "name": "Virtusa Corporation"
  },
  {
      "symbol": "VRTX",
      "name": "Vertex Pharmaceuticals Incorporated"
  },
  {
      "symbol": "VRX",
      "name": "Valeant Pharmaceuticals International, Inc."
  },
  {
      "symbol": "VSAT",
      "name": "ViaSat, Inc."
  },
  {
      "symbol": "VSBN",
      "name": "VSB Bancorp, Inc. (NY)"
  },
  {
      "symbol": "VSCI",
      "name": "Vision-Sciences, Inc."
  },
  {
      "symbol": "VSCP",
      "name": "VirtualScopics, Inc."
  },
  {
      "symbol": "VSEC",
      "name": "VSE Corporation"
  },
  {
      "symbol": "VSH",
      "name": "Vishay Intertechnology, Inc."
  },
  {
      "symbol": "VSI",
      "name": "Vitamin Shoppe, Inc"
  },
  {
      "symbol": "VSNT",
      "name": "Versant Corporation"
  },
  {
      "symbol": "VSR",
      "name": "Versar, Inc."
  },
  {
      "symbol": "VSTM",
      "name": "Verastem, Inc."
  },
  {
      "symbol": "VTA",
      "name": "Invesco Van Kampen Dynamic Credit Opportunities Fund"
  },
  {
      "symbol": "VTG",
      "name": "Vantage Drilling Company"
  },
  {
      "symbol": "VTHR",
      "name": "Vanguard Scottsdale Funds Vanguard Russell 3000 ETF"
  },
  {
      "symbol": "VTJ",
      "name": "Invesco Van Kampen Trust for Investment Grade N J Municipals"
  },
  {
      "symbol": "VTN",
      "name": "Invesco Van Kampen Trt  for Investment Grade New York Municipa"
  },
  {
      "symbol": "VTNC",
      "name": "Vitran Corporation, Inc."
  },
  {
      "symbol": "VTR",
      "name": "Ventas, Inc."
  },
  {
      "symbol": "VTSS",
      "name": "Vitesse Semiconductor Corporation"
  },
  {
      "symbol": "VTUS",
      "name": "Ventrus Biosciences, Inc."
  },
  {
      "symbol": "VTWG",
      "name": "Vanguard Scottsdale Funds Vanguard Russell 2000 Growth ETF"
  },
  {
      "symbol": "VTWO",
      "name": "Vanguard Scottsdale Funds Vanguard Russell 2000 ETF"
  },
  {
      "symbol": "VTWV",
      "name": "Vanguard Scottsdale Funds Vanguard Russell 2000 Value ETF"
  },
  {
      "symbol": "VVC",
      "name": "Vectren Corporation"
  },
  {
      "symbol": "VVI",
      "name": "Viad Corp"
  },
  {
      "symbol": "VVR",
      "name": "Invesco Van Kampen Senior Income Trust"
  },
  {
      "symbol": "VVTV",
      "name": "ValueVision Media, Inc."
  },
  {
      "symbol": "VVUS",
      "name": "VIVUS, Inc."
  },
  {
      "symbol": "VXUS",
      "name": "Vanguard STAR Funds Vanguard Total International Stock ETF"
  },
  {
      "symbol": "VYFC",
      "name": "Valley Financial Corporation"
  },
  {
      "symbol": "VZ",
      "name": "Verizon Communications Inc."
  },
  {
      "symbol": "WAB",
      "name": "Westinghouse Air Brake Technologies Corporation"
  },
  {
      "symbol": "WABC",
      "name": "Westamerica Bancorporation"
  },
  {
      "symbol": "WAC",
      "name": "Walter Investment Management Corp."
  },
  {
      "symbol": "WACLY",
      "name": "Wacoal Holdings Corporation"
  },
  {
      "symbol": "WAFD",
      "name": "Washington Federal, Inc."
  },
  {
      "symbol": "WAFDW",
      "name": "Washington Federal, Inc."
  },
  {
      "symbol": "WAG",
      "name": "Walgreen Co."
  },
  {
      "symbol": "WAIR",
      "name": "Wesco Aircraft Holdings, Inc."
  },
  {
      "symbol": "WAL",
      "name": "Western Alliance Bancorporation"
  },
  {
      "symbol": "WASH",
      "name": "Washington Trust Bancorp, Inc."
  },
  {
      "symbol": "WAT",
      "name": "Waters Corporation"
  },
  {
      "symbol": "WAVX",
      "name": "Wave Systems Corp."
  },
  {
      "symbol": "WAYN",
      "name": "Wayne Savings Bancshares Inc."
  },
  {
      "symbol": "WB^C/CL",
      "name": "WACHOVIA CORP."
  },
  {
      "symbol": "WBC",
      "name": "Wabco Holdings Inc."
  },
  {
      "symbol": "WBCO",
      "name": "Washington Banking Company"
  },
  {
      "symbol": "WBK",
      "name": "Westpac Banking Corporation"
  },
  {
      "symbol": "WBKC",
      "name": "Wolverine Bancorp, Inc."
  },
  {
      "symbol": "WBMD",
      "name": "WebMD Health Corp"
  },
  {
      "symbol": "WBS",
      "name": "Webster Financial Corporation"
  },
  {
      "symbol": "WBS/WS",
      "name": "Webster Financial Corporation"
  },
  {
      "symbol": "WBSN",
      "name": "Websense, Inc."
  },
  {
      "symbol": "WCBO",
      "name": "West Coast Bancorp"
  },
  {
      "symbol": "WCC",
      "name": "WESCO International, Inc."
  },
  {
      "symbol": "WCG",
      "name": "WellCare Helath Plans, Inc."
  },
  {
      "symbol": "WCN",
      "name": "Waste Connections, Inc."
  },
  {
      "symbol": "WCRX",
      "name": "Warner Chilcott plc"
  },
  {
      "symbol": "WD",
      "name": "Walker & Dunlop, Inc."
  },
  {
      "symbol": "WDC",
      "name": "Western Digital Corporation"
  },
  {
      "symbol": "WDFC",
      "name": "WD-40 Company"
  },
  {
      "symbol": "WDR",
      "name": "Waddell & Reed Financial, Inc."
  },
  {
      "symbol": "WEA",
      "name": "Western Asset Bond Fund"
  },
  {
      "symbol": "WEBK",
      "name": "Wellesley Bancorp, Inc."
  },
  {
      "symbol": "WEBM",
      "name": "WebMediaBrands Inc"
  },
  {
      "symbol": "WEC",
      "name": "Wisconsin Energy Corporation"
  },
  {
      "symbol": "WEN",
      "name": "Wendy&#39;s Company (The)"
  },
  {
      "symbol": "WERN",
      "name": "Werner Enterprises, Inc."
  },
  {
      "symbol": "WES",
      "name": "Western Gas Partners, LP"
  },
  {
      "symbol": "WEST",
      "name": "Westinghouse Solar, Inc."
  },
  {
      "symbol": "WETF",
      "name": "WisdomTree Investments, Inc."
  },
  {
      "symbol": "WEX",
      "name": "Winland Electronics, Inc."
  },
  {
      "symbol": "WEYS",
      "name": "Weyco Group, Inc."
  },
  {
      "symbol": "WF",
      "name": "Woori Finance Holdings Co Ltd"
  },
  {
      "symbol": "WFC",
      "name": "Wells Fargo & Company"
  },
  {
      "symbol": "WFC/WS",
      "name": "Wells Fargo & Company"
  },
  {
      "symbol": "WFC^J",
      "name": "Wells Fargo & Company"
  },
  {
      "symbol": "WFC^L",
      "name": "Wells Fargo & Company"
  },
  {
      "symbol": "WFD",
      "name": "Westfield Financial, Inc."
  },
  {
      "symbol": "WFM",
      "name": "Whole Foods Market, Inc."
  },
  {
      "symbol": "WFR",
      "name": "MEMC Electronic Materials, Inc."
  },
  {
      "symbol": "WFT",
      "name": "Weatherford International, Ltd"
  },
  {
      "symbol": "WG",
      "name": "Willbros Group, Inc."
  },
  {
      "symbol": "WGA",
      "name": "Wells-Gardner Electronics Corporation"
  },
  {
      "symbol": "WGL",
      "name": "WGL Holdings Inc"
  },
  {
      "symbol": "WGO",
      "name": "Winnebago Industries, Inc."
  },
  {
      "symbol": "WH",
      "name": "WSP Holdings Limited"
  },
  {
      "symbol": "WHG",
      "name": "Westwood Holdings Group Inc"
  },
  {
      "symbol": "WHR",
      "name": "Whirlpool Corporation"
  },
  {
      "symbol": "WHRT",
      "name": "World Heart Corporation"
  },
  {
      "symbol": "WHX",
      "name": "Whiting USA Trust I"
  },
  {
      "symbol": "WHZ",
      "name": "Whiting USA Trust II"
  },
  {
      "symbol": "WIA",
      "name": "Western Asset/Claymore U.S. Treasury Inflation Prot Secs Fd"
  },
  {
      "symbol": "WIBC",
      "name": "Wilshire Bancorp, Inc."
  },
  {
      "symbol": "WIFI",
      "name": "Boingo Wireless, Inc."
  },
  {
      "symbol": "WILC",
      "name": "G. Willi-Food International,  Ltd."
  },
  {
      "symbol": "WILN",
      "name": "Wi-Lan Inc"
  },
  {
      "symbol": "WIN",
      "name": "Windstream Corporation"
  },
  {
      "symbol": "WINA",
      "name": "Winmark Corporation"
  },
  {
      "symbol": "WIRE",
      "name": "Encore Wire Corporation"
  },
  {
      "symbol": "WIS^",
      "name": "Wisconsin Power & Light Co."
  },
  {
      "symbol": "WIT",
      "name": "Wipro Limited"
  },
  {
      "symbol": "WIW",
      "name": "Western Asset/Claymore U.S Treasury Inflation Prot Secs Fd 2"
  },
  {
      "symbol": "WLB",
      "name": "Westmoreland Coal Company"
  },
  {
      "symbol": "WLBC",
      "name": "Western Liberty Bancorp"
  },
  {
      "symbol": "WLBPZ",
      "name": "Westmoreland Coal Company"
  },
  {
      "symbol": "WLDN",
      "name": "Willdan Group, Inc."
  },
  {
      "symbol": "WLFC",
      "name": "Willis Lease Finance Corporation"
  },
  {
      "symbol": "WLFCP",
      "name": "Willis Lease Finance Corporation"
  },
  {
      "symbol": "WLK",
      "name": "Westlake Chemical Corporation"
  },
  {
      "symbol": "WLL",
      "name": "Whiting Petroleum Corporation"
  },
  {
      "symbol": "WLL^A",
      "name": "Whiting Petroleum Corporation"
  },
  {
      "symbol": "WLP",
      "name": "WellPoint Inc."
  },
  {
      "symbol": "WLT",
      "name": "Walter Energy, Inc."
  },
  {
      "symbol": "WM",
      "name": "Waste Management, Inc."
  },
  {
      "symbol": "WMAR",
      "name": "West Marine, Inc."
  },
  {
      "symbol": "WMB",
      "name": "Williams Companies, Inc. (The)"
  },
  {
      "symbol": "WMCO",
      "name": "Williams Controls, Inc."
  },
  {
      "symbol": "WMGI",
      "name": "Wright Medical Group, Inc."
  },
  {
      "symbol": "WMK",
      "name": "Weis Markets, Inc."
  },
  {
      "symbol": "WMS",
      "name": "WMS Industries Inc."
  },
  {
      "symbol": "WMT",
      "name": "Wal-Mart Stores, Inc."
  },
  {
      "symbol": "WNA^",
      "name": "Wachovia Corporation"
  },
  {
      "symbol": "WNC",
      "name": "Wabash National Corporation"
  },
  {
      "symbol": "WNI",
      "name": "Schiff Nutrition International, Inc."
  },
  {
      "symbol": "WNR",
      "name": "Western Refining, Inc."
  },
  {
      "symbol": "WNS",
      "name": "WNS (Holdings) Limited"
  },
  {
      "symbol": "WOLF",
      "name": "Great Wolf Resorts, Inc."
  },
  {
      "symbol": "WOOD",
      "name": "iShares S&P Global Timber &Forestry Index Fund"
  },
  {
      "symbol": "WOOF",
      "name": "VCA Antech, Inc."
  },
  {
      "symbol": "WOR",
      "name": "Worthington Industries, Inc."
  },
  {
      "symbol": "WPC",
      "name": "W.P. Carey & Co. LLC"
  },
  {
      "symbol": "WPCS",
      "name": "WPCS International Incorporated"
  },
  {
      "symbol": "WPI",
      "name": "Watson Pharmaceuticals, Inc."
  },
  {
      "symbol": "WPK",
      "name": "Wells Fargo & Company"
  },
  {
      "symbol": "WPO",
      "name": "Washington Post Company (The)"
  },
  {
      "symbol": "WPP",
      "name": "Wausau Paper Corp."
  },
  {
      "symbol": "WPPGY",
      "name": "WPP plc"
  },
  {
      "symbol": "WPRT",
      "name": "Westport Innovations Inc"
  },
  {
      "symbol": "WPX",
      "name": "WPX Energy, Inc."
  },
  {
      "symbol": "WPZ",
      "name": "Williams Partners L.P."
  },
  {
      "symbol": "WR",
      "name": "Westar Energy, Inc."
  },
  {
      "symbol": "WRB",
      "name": "W.R. Berkley Corporation"
  },
  {
      "symbol": "WRB^A",
      "name": "W.R. Berkley Corporation"
  },
  {
      "symbol": "WRC",
      "name": "Warnaco Group Inc (The)"
  },
  {
      "symbol": "WRD",
      "name": "Weingarten Realty Investors"
  },
  {
      "symbol": "WRE",
      "name": "Washington Real Estate Investment Trust"
  },
  {
      "symbol": "WRES",
      "name": "Warren Resources, Inc."
  },
  {
      "symbol": "WRI",
      "name": "Weingarten Realty Investors"
  },
  {
      "symbol": "WRI^D",
      "name": "Weingarten Realty Investors"
  },
  {
      "symbol": "WRI^E",
      "name": "Weingarten Realty Investors"
  },
  {
      "symbol": "WRI^F",
      "name": "Weingarten Realty Investors"
  },
  {
      "symbol": "WRLD",
      "name": "World Acceptance Corporation"
  },
  {
      "symbol": "WRLS",
      "name": "Telular Corporation"
  },
  {
      "symbol": "WRN",
      "name": "Western Copper and Gold Corporation"
  },
  {
      "symbol": "WRS/CL",
      "name": "Westar Energy, Inc."
  },
  {
      "symbol": "WSB",
      "name": "WSB Holdings, Inc."
  },
  {
      "symbol": "WSBC",
      "name": "WesBanco, Inc."
  },
  {
      "symbol": "WSBF",
      "name": "Waterstone Financial, Inc."
  },
  {
      "symbol": "WSCI",
      "name": "WSI Industries Inc."
  },
  {
      "symbol": "WSFS",
      "name": "WSFS Financial Corporation"
  },
  {
      "symbol": "WSH",
      "name": "Willis Group Holdings Limited"
  },
  {
      "symbol": "WSM",
      "name": "Williams-Sonoma, Inc."
  },
  {
      "symbol": "WSO",
      "name": "Watsco, Inc."
  },
  {
      "symbol": "WSO/B",
      "name": "Watsco, Inc."
  },
  {
      "symbol": "WSR",
      "name": "Whitestone REIT"
  },
  {
      "symbol": "WST",
      "name": "West Pharmaceutical Services, Inc."
  },
  {
      "symbol": "WSTG",
      "name": "Wayside Technology Group, Inc."
  },
  {
      "symbol": "WSTL",
      "name": "Westell Technologies, Inc."
  },
  {
      "symbol": "WTBA",
      "name": "West Bancorporation"
  },
  {
      "symbol": "WTFC",
      "name": "Wintrust Financial Corporation"
  },
  {
      "symbol": "WTFCW",
      "name": "Wintrust Financial Corporation"
  },
  {
      "symbol": "WTI",
      "name": "W&T Offshore, Inc."
  },
  {
      "symbol": "WTM",
      "name": "White Mountains Insurance Group, Ltd."
  },
  {
      "symbol": "WTR",
      "name": "Aqua America, Inc."
  },
  {
      "symbol": "WTS",
      "name": "Watts Water Technologies, Inc."
  },
  {
      "symbol": "WTSLA",
      "name": "The Wet Seal, Inc."
  },
  {
      "symbol": "WTT",
      "name": "Wireless Telecom Group,  Inc."
  },
  {
      "symbol": "WTW",
      "name": "Weight Watchers International Inc"
  },
  {
      "symbol": "WU",
      "name": "Western Union Company (The)"
  },
  {
      "symbol": "WUHN",
      "name": "Wuhan General Group (China), Inc."
  },
  {
      "symbol": "WVFC",
      "name": "WVS Financial Corp."
  },
  {
      "symbol": "WVVI",
      "name": "Willamette Valley Vineyards, Inc."
  },
  {
      "symbol": "WWAY",
      "name": "Westway Group, Inc."
  },
  {
      "symbol": "WWD",
      "name": "Woodward, Inc."
  },
  {
      "symbol": "WWE",
      "name": "World Wrestling Entertainment, Inc."
  },
  {
      "symbol": "WWIN",
      "name": "Winner Medical Group Inc."
  },
  {
      "symbol": "WWVY",
      "name": "Warwick Valley Telephone Company"
  },
  {
      "symbol": "WWW",
      "name": "Wolverine World Wide, Inc."
  },
  {
      "symbol": "WWWW",
      "name": "Web.com Group, Inc"
  },
  {
      "symbol": "WWZ^K",
      "name": "SiM Internal Test 10"
  },
  {
      "symbol": "WX",
      "name": "Wuxi Pharmatech (Cayman) Inc."
  },
  {
      "symbol": "WXS",
      "name": "Wright Express Corporation"
  },
  {
      "symbol": "WY",
      "name": "Weyerhaeuser Company"
  },
  {
      "symbol": "WYN",
      "name": "Wyndham Worldwide Corp"
  },
  {
      "symbol": "WYNN",
      "name": "Wynn Resorts, Limited"
  },
  {
      "symbol": "WYY",
      "name": "WidePoint Corporation"
  },
  {
      "symbol": "WZE",
      "name": "WIZZARD SOFTWARE CORPORATION"
  },
  {
      "symbol": "X",
      "name": "United States Steel Corporation"
  },
  {
      "symbol": "XAA",
      "name": "American Municipal Income Portfolio"
  },
  {
      "symbol": "XATA",
      "name": "XATA Corporation"
  },
  {
      "symbol": "XBKS",
      "name": "Xenith Bankshares, Inc."
  },
  {
      "symbol": "XCJ",
      "name": "Xcel Energy Inc."
  },
  {
      "symbol": "XCO",
      "name": "EXCO Resources NL"
  },
  {
      "symbol": "XEC",
      "name": "Cimarex Energy Co"
  },
  {
      "symbol": "XEL",
      "name": "Xcel Energy Inc."
  },
  {
      "symbol": "XFD",
      "name": "Lehman ABS Corporation"
  },
  {
      "symbol": "XFH",
      "name": "Lehman ABS Corporation"
  },
  {
      "symbol": "XFP",
      "name": "Lehman ABS Corporation"
  },
  {
      "symbol": "XFR",
      "name": "Lehman ABS Corporation"
  },
  {
      "symbol": "XG",
      "name": "Extorre Gold Mines Ltd."
  },
  {
      "symbol": "XIDE",
      "name": "Exide Technologies"
  },
  {
      "symbol": "XIN",
      "name": "Xinyuan Real Estate Co Ltd"
  },
  {
      "symbol": "XING",
      "name": "Qiao Xing Universal Resources, Inc."
  },
  {
      "symbol": "XKE",
      "name": "Lehman ABS Corporation"
  },
  {
      "symbol": "XKN",
      "name": "Lehman ABS Corporation"
  },
  {
      "symbol": "XKO",
      "name": "Lehman ABS Corporation"
  },
  {
      "symbol": "XL",
      "name": "XL Group plc"
  },
  {
      "symbol": "XLNX",
      "name": "Xilinx, Inc."
  },
  {
      "symbol": "XLS",
      "name": "Exelis Inc."
  },
  {
      "symbol": "XNPT",
      "name": "XenoPort, Inc."
  },
  {
      "symbol": "XNY",
      "name": "China Xiniya Fashion Limited"
  },
  {
      "symbol": "XOM",
      "name": "Exxon Mobil Corporation"
  },
  {
      "symbol": "XOMA",
      "name": "XOMA Corporation"
  },
  {
      "symbol": "XOXO",
      "name": "The Knot, Inc."
  },
  {
      "symbol": "XPL",
      "name": "Solitario Exploration & Royalty Corp"
  },
  {
      "symbol": "XPO",
      "name": "XPO Logistics, Inc."
  },
  {
      "symbol": "XRA",
      "name": "Exeter Resource Corporation"
  },
  {
      "symbol": "XRAY",
      "name": "DENTSPLY International Inc."
  },
  {
      "symbol": "XRIT",
      "name": "X-Rite, Incorporated"
  },
  {
      "symbol": "XRM",
      "name": "Xerium Technologies, Inc."
  },
  {
      "symbol": "XRS",
      "name": "TAL Education Group"
  },
  {
      "symbol": "XRTX",
      "name": "Xyratex Ltd."
  },
  {
      "symbol": "XRX",
      "name": "Xerox Corporation"
  },
  {
      "symbol": "XTEX",
      "name": "Crosstex Energy, L.P."
  },
  {
      "symbol": "XTXI",
      "name": "Crosstex Energy, Inc."
  },
  {
      "symbol": "XUE",
      "name": "Xueda Education Group"
  },
  {
      "symbol": "XVG",
      "name": "Lehman ABS Corporation"
  },
  {
      "symbol": "XWES",
      "name": "World Energy Solutions Inc (DE)"
  },
  {
      "symbol": "XXIA",
      "name": "Ixia"
  },
  {
      "symbol": "XYL",
      "name": "Xylem Inc."
  },
  {
      "symbol": "Y",
      "name": "Alleghany Corporation"
  },
  {
      "symbol": "YAVY",
      "name": "Yadkin Valley Financial Corporation"
  },
  {
      "symbol": "YDNT",
      "name": "Young Innovations, Inc."
  },
  {
      "symbol": "YELP",
      "name": "Yelp Inc."
  },
  {
      "symbol": "YGE",
      "name": "Yingli Green Energy Holding Company Limited"
  },
  {
      "symbol": "YHOO",
      "name": "Yahoo! Inc."
  },
  {
      "symbol": "YMI",
      "name": "YM BioSciences, Inc."
  },
  {
      "symbol": "YNDX",
      "name": "Yandex N.V."
  },
  {
      "symbol": "YOKU",
      "name": "Youku Inc."
  },
  {
      "symbol": "YONG",
      "name": "Yongye International, Inc."
  },
  {
      "symbol": "YORW",
      "name": "The York Water Company"
  },
  {
      "symbol": "YPF",
      "name": "YPF Sociedad Anonima"
  },
  {
      "symbol": "YRCW",
      "name": "YRC Worldwide, Inc."
  },
  {
      "symbol": "YTEC",
      "name": "Yucheng Technologies Limited"
  },
  {
      "symbol": "YUM",
      "name": "Yum! Brands, Inc."
  },
  {
      "symbol": "YZC",
      "name": "Yanzhou Coal Mining Company Limited"
  },
  {
      "symbol": "Z",
      "name": "Zillow, Inc."
  },
  {
      "symbol": "ZA",
      "name": "Zuoan Fashion Limited"
  },
  {
      "symbol": "ZAGG",
      "name": "ZAGG Inc"
  },
  {
      "symbol": "ZAZA",
      "name": "ZaZa Energy Corporation"
  },
  {
      "symbol": "ZB^A",
      "name": "Zions Bancorporation"
  },
  {
      "symbol": "ZB^B",
      "name": "Zions Bancorporation"
  },
  {
      "symbol": "ZB^C",
      "name": "Zions Bancorporation"
  },
  {
      "symbol": "ZB^E",
      "name": "Zions Bancorporation"
  },
  {
      "symbol": "ZBB",
      "name": "ZBB Energy Corporation"
  },
  {
      "symbol": "ZBRA",
      "name": "Zebra Technologies Corporation"
  },
  {
      "symbol": "ZEP",
      "name": "Zep Inc."
  },
  {
      "symbol": "ZEUS",
      "name": "Olympic Steel, Inc."
  },
  {
      "symbol": "ZF",
      "name": "Zweig Fund, Inc. (The)"
  },
  {
      "symbol": "ZGNX",
      "name": "Zogenix, Inc."
  },
  {
      "symbol": "ZHNE",
      "name": "Zhone Technologies, Inc."
  },
  {
      "symbol": "ZIGO",
      "name": "Zygo Corporation"
  },
  {
      "symbol": "ZINC",
      "name": "Horsehead Holding Corp."
  },
  {
      "symbol": "ZION",
      "name": "Zions Bancorporation"
  },
  {
      "symbol": "ZIONW",
      "name": "Zions Bancorporation"
  },
  {
      "symbol": "ZIOP",
      "name": "ZIOPHARM Oncology Inc"
  },
  {
      "symbol": "ZIP",
      "name": "Zipcar, Inc."
  },
  {
      "symbol": "ZIPR",
      "name": "ZipRealty, Inc."
  },
  {
      "symbol": "ZIXI",
      "name": "Zix Corporation"
  },
  {
      "symbol": "ZLC",
      "name": "Zale Corporation"
  },
  {
      "symbol": "ZLCS",
      "name": "Zalicus Inc."
  },
  {
      "symbol": "ZLTQ",
      "name": "ZELTIQ Aesthetics, Inc."
  },
  {
      "symbol": "ZMH",
      "name": "Zimmer Holdings, Inc."
  },
  {
      "symbol": "ZN",
      "name": "Zion Oil & Gas Inc"
  },
  {
      "symbol": "ZNGA",
      "name": "Zynga Inc."
  },
  {
      "symbol": "ZNH",
      "name": "China Southern Airlines Company Limited"
  },
  {
      "symbol": "ZNWAL",
      "name": "Zion Oil & Gas Inc"
  },
  {
      "symbol": "ZNWAW",
      "name": "Zion Oil & Gas Inc"
  },
  {
      "symbol": "ZNWAZ",
      "name": "Zion Oil & Gas Inc"
  },
  {
      "symbol": "ZOLT",
      "name": "Zoltek Companies, Inc."
  },
  {
      "symbol": "ZOOM",
      "name": "Zoom Technologies, Inc."
  },
  {
      "symbol": "ZQK",
      "name": "Quiksilver, Inc."
  },
  {
      "symbol": "ZTR",
      "name": "Zweig Total Return Fund, Inc. (The)"
  },
  {
      "symbol": "ZUMZ",
      "name": "Zumiez Inc."
  },
  {
      "symbol": "ZX",
      "name": "China Zenix Auto International Limited"
  },
  {
      "symbol": "ZXX",
      "name": "SM Listed Test 3"
  },
  {
      "symbol": "ZXX^F",
      "name": "SM Listed Test 3"
  },
  {
      "symbol": "ZY^A",
      "name": "Cqs Test Secid"
  },
  {
      "symbol": "ZYY",
      "name": "SM Listed Test 2"
  },
  {
      "symbol": "ZYY^A",
      "name": "SM Listed Test 2"
  },
  {
      "symbol": "ZYZ^K",
      "name": "SiM Internal Test 11"
  },
  {
      "symbol": "ZZ",
      "name": "Sealy Corporation"
  },
  {
      "symbol": "ZZA",
      "name": "SM Listed Test 2"
  },
  {
      "symbol": "ZZB",
      "name": "SM Listed Test 2"
  },
  {
      "symbol": "ZZC",
      "name": "Sealy Corporation"
  },
  {
      "symbol": "ZZD",
      "name": "SM Listed Test 2"
  },
  {
      "symbol": "ZZE",
      "name": "SM Listed Test 2"
  },
  {
      "symbol": "ZZF",
      "name": "SM Listed Test 2"
  },
  {
      "symbol": "ZZG",
      "name": "SM Listed Test 2"
  },
  {
      "symbol": "ZZH",
      "name": "SM Listed Test 2"
  },
  {
      "symbol": "ZZI",
      "name": "SM Listed Test 2"
  },
  {
      "symbol": "ZZJ",
      "name": "SM Listed Test 2"
  },
  {
      "symbol": "ZZJJ",
      "name": "SM Listed Test 2"
  }
];

const TIME_PERIODS = [
    { 
      label: '1D', 
      settings: { 
        periodType: 'day',
        period: 1,
        frequencyType: 'minute',
        frequency: 1
      } 
    },
    { 
      label: '5D', 
      settings: { 
        periodType: 'day',
        period: 5,
        frequencyType: 'minute',
        frequency: 5
      } 
    },
    { 
      label: '1M', 
      settings: { 
        periodType: 'day',
        period: null,
        frequencyType: 'minute',
        frequency: 10
      } 
    },
    { 
      label: '3M', 
      settings: { 
        periodType: 'day',
        period: null,
        frequencyType: 'minute',
        frequency: 15
      } 
    },
    { 
      label: '6M', 
      settings: { 
        periodType: 'day',
        period: null,
        frequencyType: 'minute',
        frequency: 30
      } 
    },
    { 
      label: 'YTD', 
      settings: { 
        periodType: 'ytd',
        period: 1,
        frequencyType: 'daily',
        frequency: 1
      } 
    },
    { 
      label: '1Y', 
      settings: { 
        periodType: 'year',
        period: 1,
        frequencyType: 'daily',
        frequency: 1
      } 
    },
    { 
      label: '5Y', 
      settings: { 
        periodType: 'year',
        period: 5,
        frequencyType: 'weekly',
        frequency: 1
      } 
    }
  ];
  
const INDICATOR_SETTINGS = [
    {
        label: 'EMA',
        settings: {
            period: 14,
            series: 'close',
            color: 'rgba(251, 104, 12, 0.92)',
            width: 2,
            opacity: 1,
            visible: false
        }
    },
    {
        label: 'SMA',
        settings: {
            period: 14,
            series: 'close',
            color: 'rgba(189, 41, 222, 0.79)',
            width: 2,
            opacity: 1,
            visible: false
        }
    },
    // {
    //     label: 'RSI',
    //     settings: {
    //         period: 14,
    //         series: 'close',
    //         color: 'rgba(0, 255, 0, 0.79)',
    //         width: 2,
    //         opacity: 1,
    //         visible: false
    //     }
    // },
    // {
    //     label: 'MACD',
    //     settings: {
    //         series: 'close',
    //         color: 'rgba(0, 0, 255, 0.79)',
    //         width: 2,
    //         opacity: 1,
    //         visible: false,
    //         signal: {
    //             period: 9,
    //             color: 'rgba(255, 0, 0, 0.79)',
    //             width: 2,
    //             opacity: 1
    //         },
    //         histogram: {
    //             color: 'rgba(255, 255, 0, 0.79)',
    //             width: 2,
    //             opacity: 1
    //         }
    //     }
    // },
    // {
    //     label: 'Bollinger Bands',
    //     settings: {
    //         period: 20,
    //         series: 'close',
    //         color: 'rgba(0, 0, 255, 0.79)',
    //         width: 2,
    //         opacity: 1,
    //         upper: {
    //             color: 'rgba(255, 0, 0, 0.79)',
    //             width: 2,
    //             opacity: 1
    //         },
    //         lower: {
    //             color: 'rgba(0, 255, 0, 0.79)',
    //             width: 2,
    //             opacity: 1
    //         },
    //         visible: false
    //     }
    // },
    // {
    //     label: 'Stochastic',
    //     settings: {
    //         period: 14,
    //         series: 'close',
    //         color: 'rgba(0, 0, 255, 0.79)',
    //         width: 2,
    //         opacity: 1,
    //         signal: {
    //             period: 3,
    //             color: 'rgba(255, 0, 0, 0.79)',
    //             width: 2,
    //             opacity: 1
    //         },
    //         visible: false
    //     }
    // },
    // {
    //     label: 'CCI',
    //     settings: {
    //         period: 14,
    //         series: 'close',
    //         color: 'rgba(0, 255, 0, 0.79)',
    //         width: 2,
    //         opacity: 1,
    //         visible: false
    //     }
    // },
    // {
    //     label: 'ATR',
    //     settings: {
    //         period: 14,
    //         series: 'close',
    //         color: 'rgba(0, 255, 0, 0.79)',
    //         width: 2,
    //         opacity: 1,
    //         visible: false
    //     }
    // },
    // {
    //     label: 'ADX',
    //     settings: {
    //         period: 14,
    //         series: 'close',
    //         color: 'rgba(0, 255, 0, 0.79)',
    //         width: 2,
    //         opacity: 1,
    //         visible: false,
    //         signal: {
    //             period: 14,
    //             color: 'rgba(255, 0, 0, 0.79)',
    //             width: 2,
    //             opacity: 1
    //         }
    //     }
    // },
    // {
    //     label: 'Williams %R',
    //     settings: {
    //         period: 14,
    //         series: 'close',
    //         color: 'rgba(0, 255, 0, 0.79)',
    //         width: 2,
    //         opacity: 1,
    //         visible: false
    //     }
    // },
    // {
    //     label: 'MFI',
    //     settings: {
    //         period: 14,
    //         series: 'close',
    //         color: 'rgba(0, 255, 0, 0.79)',
    //         width: 2,
    //         opacity: 1,
    //         visible: false
    //     }
    // },
    // {
    //     label: 'VWAP',
    //     settings: {
    //         period: 14,
    //         series: 'close',
    //         color: 'rgba(0, 255, 0, 0.79)',
    //         width: 2,
    //         opacity: 1,
    //         visible: false
    //     }
    // },
    // {
    //     label: 'Volume',
    //     settings: {
    //         color: 'rgba(0, 255, 0, 0.79)',
    //         priceFormat: { type: 'volume' },
    //         priceScaleId: '',
    //         visible: false
    //     }
    // },
    // {
    //     label: 'OBV',
    //     settings: {
    //         color: 'rgba(0, 255, 0, 0.79)',
    //         priceFormat: { type: 'volume' },
    //         priceScaleId: '',
    //         visible: false
    //     }
    // },
    // {
    //     label: 'Accumulation/Distribution',
    //     settings: {
    //         color: 'rgba(0, 255, 0, 0.79)',
    //         priceFormat: { type: 'volume' },
    //         priceScaleId: '',
    //         visible: false
    //     }
    // },
    // {
    //     label: 'Chaikin A/D Line',
    //     settings: {
    //         color: 'rgba(0, 255, 0, 0.79)',
    //         priceFormat: { type: 'volume' },
    //         priceScaleId: '',
    //         visible: false
    //     }
    // },
    // {
    //     label: 'Chaikin Oscillator',
    //     settings: {
    //         color: 'rgba(0, 255, 0, 0.79)',
    //         priceFormat: { type: 'volume' },
    //         priceScaleId: '',
    //         visible: false,
    //         signal: {
    //             period: 3,
    //             color: 'rgba(255, 0, 0, 0.79)',
    //             width: 2,
    //             opacity: 1
    //         }
    //     }
    // },
    // {
    //     label: 'Aroon',
    //     settings: {
    //         period: 14,
    //         series: 'close',
    //         color: 'rgba(0, 255, 0, 0.79)',
    //         width: 2,
    //         opacity: 1,
    //         visible: false,
    //         signal: {
    //             period: 14,
    //             color: 'rgba(255, 0, 0, 0.79)',
    //             width: 2,
    //             opacity: 1
    //         }
    //     }
    // },
    // {
    //     label: 'Parabolic SAR',
    //     settings: {
    //         acceleration: 0.02,
    //         maxAcceleration: 0.2,
    //         series: 'close',
    //         color: 'rgba(0, 255, 0, 0.79)',
    //         width: 2,
    //         opacity: 1,
    //         visible: false
    //     }
    // },
    // {
    //     label: 'Pivot Points',
    //     settings: {
    //         period: 14,
    //         series: 'close',
    //         color: 'rgba(0, 255, 0, 0.79)',
    //         width: 2,
    //         opacity: 1,
    //         visible: false,
    //         support: {
    //             color: 'rgba(255, 0, 0, 0.79)',
    //             width: 2,
    //             opacity: 1
    //         },
    //         resistance: {
    //             color: 'rgba(0, 0, 255, 0.79)',
    //             width: 2,
    //             opacity: 1
    //         }
    //     }
    // },
    // {
    //     label: 'Fibonacci Retracement',
    //     settings: {
    //         period: 14,
    //         series: 'close',
    //         color: 'rgba(0, 255, 0, 0.79)',
    //         width: 2,
    //         opacity: 1,
    //         visible: false,
    //         levels: [
    //             { level: 0.236, color: 'rgba(255, 0, 0, 0.79)' },
    //             { level: 0.382, color: 'rgba(0, 255, 0, 0.79)' },
    //             { level: 0.618, color: 'rgba(0, 0, 255, 0.79)' },
    //             { level: 0.786, color: 'rgba(255, 255, 0, 0.79)' }
    //         ]
    //     }
    // },
    // {
    //     label: 'Donchian Channels',
    //     settings: {
    //         period: 20,
    //         series: 'close',
    //         color: 'rgba(0, 255, 0, 0.79)',
    //         width: 2,
    //         opacity: 1,
    //         upper: {
    //             color: 'rgba(255, 0, 0, 0.79)',
    //             width: 2,
    //             opacity: 1
    //         },
    //         lower: {
    //             color: 'rgba(0, 0, 255, 0.79)',
    //             width: 2,
    //             opacity: 1
    //         },
    //         visible: false
    //     }
    // },
    // {
    //     label: 'Keltner Channels',
    //     settings: {
    //         period: 20,
    //         series: 'close',
    //         color: 'rgba(0, 255, 0, 0.79)',
    //         width: 2,
    //         opacity: 1,
    //         upper: {
    //             color: 'rgba(255, 0, 0, 0.79)',
    //             width: 2,
    //             opacity: 1
    //         },
    //         lower: {
    //             color: 'rgba(0, 0, 255, 0.79)',
    //             width: 2,
    //             opacity: 1
    //         },
    //         visible: false
    //     }
    // },
    // {
    //     label: 'Ichimoku Cloud',
    //     settings: {
    //         period: 9,
    //         series: 'close',
    //         color: 'rgba(0, 255, 0, 0.79)',
    //         width: 2,
    //         opacity: 1,
    //         tenkan: {
    //             period: 9,
    //             color: 'rgba(255, 0, 0, 0.79)',
    //             width: 2,
    //             opacity: 1
    //         },
    //         kijun: {
    //             period: 26,
    //             color: 'rgba(0, 0, 255, 0.79)',
    //             width: 2,
    //             opacity: 1
    //         },
    //         senkou: {
    //             period: 52,
    //             color: 'rgba(255, 255, 0, 0.79)',
    //             width: 2,
    //             opacity: 1
    //         },
    //         chiku: {
    //             period: 26,
    //             color: 'rgba(0, 255, 255, 0.79)',
    //             width: 2,
    //             opacity: 1
    //         },
    //         visible: false
    //     }
    // }
    ];

export const ChartWidget = ({ onRemove }) => {
    const chartContainerRef = useRef(null);
    const [inputValue, setInputValue] = useState('');
    const [symbol, setSymbol] = useState(null);
    const [suggestions, setSuggestions] = useState(SYMBOL_OPTIONS);
    
    const [activeIndicators, setActiveIndicators] = useState(
        INDICATOR_SETTINGS.reduce((acc, indicator) => {
            acc[indicator.label] = false;
            return acc;
        }, {})
    );

    const [timeSettings, setTimeSettings] = useState(TIME_PERIODS[0].settings);
    const [timeAnchorEl, setTimeAnchorEl] = useState(null);
    const [indicatorAnchorEl, setIndicatorAnchorEl] = useState(null);
    const [customizeDialogOpen, setCustomizeDialogOpen] = useState(false);
    const [selectedDrawing, setSelectedDrawing] = useState(null);

    const { 
        isLoading, 
        error, 
        selectedDrawingTool, 
        hasSelectedDrawing,
        selectDrawingTool, 
        deleteSelectedDrawing,
        customizeDrawing,
        getSelectedDrawing 
    } = useChart(
        chartContainerRef, 
        symbol, 
        timeSettings, 
        INDICATOR_SETTINGS, 
        activeIndicators
    );

    const handleCustomizeDrawing = () => {
        const drawing = getSelectedDrawing();
        if (drawing) {
          setSelectedDrawing(drawing);
          setCustomizeDialogOpen(true);
        }
      };
    
    const handleCustomizeSubmit = (changes) => {
        customizeDrawing(changes);
        setCustomizeDialogOpen(false);
    };

    useEffect(() => {
        if (inputValue.trim() === '') {
            setSuggestions(SYMBOL_OPTIONS);
        } else {
            const filtered = SYMBOL_OPTIONS.filter(option =>
                option.symbol.toLowerCase().includes(inputValue.toLowerCase()) ||
                option.name.toLowerCase().includes(inputValue.toLowerCase())
            );
            setSuggestions(filtered);
        }
    }, [inputValue]);

    // Time period dropdown handlers
    const handleTimeMenuOpen = (event) => {
        setTimeAnchorEl(event.currentTarget);
    };
    
    const handleTimeMenuClose = () => {
        setTimeAnchorEl(null);
    };
    
    const handleTimePeriodSelect = (settings) => {
        setTimeSettings(settings);
        handleTimeMenuClose();
    };
    
    // Indicator dropdown handlers
    const handleIndicatorMenuOpen = (event) => {
        setIndicatorAnchorEl(event.currentTarget);
    };
    
    const handleIndicatorMenuClose = () => {
        setIndicatorAnchorEl(null);
    };
    
    const handleIndicatorSelect = (indicatorLabel) => {
        setActiveIndicators(prev => ({
            ...prev,
            [indicatorLabel]: !prev[indicatorLabel]
        }));
    };

    const handleSymbolChange = (event, newValue) => {
        if (newValue && typeof newValue !== 'string') {
            setSymbol(newValue.symbol);
        } else if (newValue) {
            const found = SYMBOL_OPTIONS.find(
                opt => opt.symbol === newValue.toUpperCase()
            );
            setSymbol(found ? found.symbol : newValue.toUpperCase());
        } else {
            setSymbol(null);
        }
    };

    // Header dropdown content
    const dropdownContent = (
        <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            padding: '8px 0'
        }}>
            {/* Symbol Search */}
            <Box sx={{ width: 400 }}>
                <Autocomplete
                    freeSolo
                    options={suggestions}
                    getOptionLabel={(option) => 
                        typeof option === 'string' ? option : `${option.symbol} - ${option.name}`
                    }
                    inputValue={inputValue}
                    onInputChange={(event, newInputValue) => {
                        setInputValue(newInputValue);
                    }}
                    onChange={handleSymbolChange}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Enter Ticker Symbol"
                            variant="outlined"
                            size="small"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'white',
                                    '& fieldset': {
                                        borderColor: 'rgba(0, 0, 0, 0.23)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(0, 0, 0, 0.5)',
                                    },
                                },
                            }}
                        />
                    )}
                    renderOption={(props, option) => (
                        <Box component="li" {...props}>
                            <Typography variant="body2">
                                <strong>{option.symbol}</strong> - {option.name}
                            </Typography>
                        </Box>
                    )}
                />
            </Box>
            
            {/* Time Period Dropdown */}
            <Box sx={{ position: 'relative' }}>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={handleTimeMenuOpen}
                    endIcon={<ArrowDropDownIcon />}
                    disabled={!symbol}
                    sx={{
                        minWidth: '120px',
                        justifyContent: 'space-between',
                        backgroundColor: 'inherit',
                        color: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.23)',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            borderColor: 'rgba(255, 255, 255, 0.5)'
                        }
                    }}
                >
                    {TIME_PERIODS.find(p => JSON.stringify(p.settings) === JSON.stringify(timeSettings))?.label || 'Time Frame'}
                </Button>
                <Menu
                    anchorEl={timeAnchorEl}
                    open={Boolean(timeAnchorEl)}
                    onClose={handleTimeMenuClose}
                >
                    {TIME_PERIODS.map((period) => (
                        <MenuItem
                            key={period.label}
                            onClick={() => handleTimePeriodSelect(period.settings)}
                            selected={JSON.stringify(timeSettings) === JSON.stringify(period.settings)}
                        >
                            {period.label}
                        </MenuItem>
                    ))}
                </Menu>
            </Box>
            
            {/* Indicators Dropdown */}
            <Box sx={{ position: 'relative' }}>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={handleIndicatorMenuOpen}
                    endIcon={<ArrowDropDownIcon />}
                    disabled={!symbol}
                    sx={{
                        minWidth: '120px',
                        justifyContent: 'space-between',
                        backgroundColor: 'inherit',
                        color: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.23)',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            borderColor: 'rgba(255, 255, 255, 0.5)'
                        }
                    }}
                >
                    Indicators
                </Button>
                <Menu
                    anchorEl={indicatorAnchorEl}
                    open={Boolean(indicatorAnchorEl)}
                    onClose={handleIndicatorMenuClose}
                >
                    {INDICATOR_SETTINGS.map((indicator) => (
                        <MenuItem
                            key={indicator.label}
                            onClick={() => handleIndicatorSelect(indicator.label)}
                            sx={{
                                backgroundColor: activeIndicators[indicator.label] 
                                    ? 'rgba(25, 118, 210, 0.16)' 
                                    : 'inherit',
                            }}
                        >
                            {indicator.label}
                        </MenuItem>
                    ))}
                </Menu>
            </Box>
        </Box>
    );

    return (
        <WidgetFrame 
            title={symbol || "Chart Widget"}
            onRemove={onRemove}
            dropdownContent={dropdownContent}
        >
            <div
                ref={chartContainerRef}
                className="chart-container"
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative'
                }}
            >
                {/* Drawing Tools Overlay */}
                {symbol && (
                <DrawingToolbar 
                    selectedTool={selectedDrawingTool}
                    onSelectTool={selectDrawingTool}
                    onDeleteSelected={deleteSelectedDrawing}
                    hasSelectedDrawing={hasSelectedDrawing}
                    onCustomizeDrawing={handleCustomizeDrawing}
                />
                )}
            </div>

            {/* Customization Dialog */}
            <Dialog 
                open={customizeDialogOpen} 
                onClose={() => setCustomizeDialogOpen(false)}
            >
                <DrawingCustomizer
                drawing={selectedDrawing}
                onSubmit={handleCustomizeSubmit}
                onCancel={() => setCustomizeDialogOpen(false)}
                />
            </Dialog>
            
            {!symbol && (
                <Typography variant="body2" sx={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    color: 'text.secondary'
                }}>
                    Please enter a ticker symbol to view the chart
                </Typography>
            )}
            {isLoading && (
                <Typography variant="body2" sx={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    color: 'text.secondary'
                }}>
                    Loading...
                </Typography>
            )}
            {error && (
                <Typography variant="body2" sx={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    color: 'error.main'
                }}>
                    Error: {error}
                </Typography>
            )}
        </WidgetFrame>
    );
};

// New component for drawing customization
const DrawingCustomizer = ({ drawing, onSubmit, onCancel }) => {
    const [color, setColor] = useState(drawing?.color || '#000000');
    const [fibLevels, setFibLevels] = useState(drawing?.fibLevels || []);
  
    const handleSubmit = () => {
      onSubmit({
        color,
        fibLevels: drawing.type.includes('fib') ? fibLevels : undefined,
      });
    };
  
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Customize Drawing</h3>
  
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Color</label>
          <SketchPicker
            color={color}
            onChangeComplete={(colorResult) => setColor(colorResult.hex)}
          />
        </div>
  
        {drawing?.type.includes('fib') && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Fibonacci Levels</label>
            {fibLevels.map((level, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="number"
                  step="0.001"
                  value={level.level}
                  onChange={(e) => {
                    const newLevels = [...fibLevels];
                    newLevels[index].level = parseFloat(e.target.value);
                    setFibLevels(newLevels);
                  }}
                  className="w-24 px-2 py-1 border rounded"
                />
                <span className="py-1">{level.label}</span>
              </div>
            ))}
          </div>
        )}
  
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Apply
          </button>
        </div>
      </div>
    );
  };