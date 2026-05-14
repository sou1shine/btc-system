/* ============================================================
   BTC System - Dark Mode Inline Style Auto-Fix
   목적: HTML inline style="background-color:#xxx" / "background:#xxx" 의
        밝은 색상을 다크모드에서 자동으로 다크 톤으로 변환.
        - inline 색상의 luminance(밝기) 계산 → 0.55 이상이면 "밝은 색"
        - 다크모드 시 배경 = rgba(원본 색상, 0.08~0.1) + 테두리 강조
        - 텍스트 색은 그대로 (다크모드 기본 밝은 색 유지)
   적용: 모든 페이지 <head> 또는 <body> 끝에 <script defer> 로드
   ============================================================ */

(function () {
  'use strict';

  // ─── 1) 다크모드 감지 + 변경 시 재적용 ───
  const mql = window.matchMedia('(prefers-color-scheme: dark)');

  function applyFix() {
    if (mql.matches) {
      document.documentElement.classList.add('dm-fix-active');
      processAll();
    } else {
      document.documentElement.classList.remove('dm-fix-active');
      restoreAll();
    }
  }

  // ─── 2) 색상 파싱 (hex → rgb) ───
  function hexToRgb(hex) {
    hex = hex.replace('#', '').trim();
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    if (hex.length !== 6) return null;
    const num = parseInt(hex, 16);
    if (Number.isNaN(num)) return null;
    return {
      r: (num >> 16) & 0xff,
      g: (num >> 8) & 0xff,
      b: num & 0xff
    };
  }

  // 표준 luminance 계산 (sRGB)
  function luminance(rgb) {
    const a = [rgb.r, rgb.g, rgb.b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }

  // ─── 3) HTML 요소의 inline background 색상 추출 ───
  const bgRegex = /background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\))/g;

  function extractBgColor(styleStr) {
    if (!styleStr) return null;
    bgRegex.lastIndex = 0;
    const matches = [...styleStr.matchAll(bgRegex)];
    if (matches.length === 0) return null;
    return matches[matches.length - 1][1]; // 마지막 match 사용
  }

  function colorToRgb(color) {
    if (!color) return null;
    color = color.trim();
    if (color.startsWith('#')) return hexToRgb(color);
    const m = color.match(/rgb[a]?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (m) return { r: +m[1], g: +m[2], b: +m[3] };
    return null;
  }

  // ─── 4) 모든 inline 배경 요소 변환 ───
  function processAll() {
    const elements = document.querySelectorAll('[style*="background"]');
    elements.forEach(el => {
      const styleStr = el.getAttribute('style');
      const bgColor = extractBgColor(styleStr);
      if (!bgColor) return;

      const rgb = colorToRgb(bgColor);
      if (!rgb) return;

      const lum = luminance(rgb);

      // 밝은 색만 변환 (0.55 이상 / 베이지·노랑·연녹 등 모두 포함)
      if (lum < 0.55) return;

      // 백업 (라이트 모드 복귀용)
      if (!el.dataset.dmFixOriginal) {
        el.dataset.dmFixOriginal = styleStr;
      }

      // 다크 톤 변환: 원본 색조 유지 + 알파 0.08~0.1
      const newBg = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`;
      const newBorder = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)`;

      // 새 style 적용 (기존 inline background-color/background 만 교체)
      let newStyle = styleStr;
      newStyle = newStyle.replace(/background-color\s*:\s*#[0-9a-fA-F]{3,8}\s*;?/g, '');
      newStyle = newStyle.replace(/background\s*:\s*#[0-9a-fA-F]{3,8}\s*;?/g, '');
      newStyle = newStyle.replace(/background-color\s*:\s*rgb[a]?\([^)]+\)\s*;?/g, '');
      newStyle = newStyle.replace(/background\s*:\s*rgb[a]?\([^)]+\)\s*;?/g, '');

      // border-color도 같은 색조면 보정
      const existingBorder = /border(?:-color)?\s*:\s*[^;]*#[0-9a-fA-F]{3,8}/.test(newStyle);
      if (!existingBorder) {
        newStyle += `; background-color: ${newBg}`;
      } else {
        newStyle += `; background-color: ${newBg}`;
      }

      el.setAttribute('style', newStyle);
      el.dataset.dmFixApplied = '1';
      el.style.setProperty('--dm-original-color', bgColor);
    });
  }

  // ─── 5) 라이트 모드 복귀 ───
  function restoreAll() {
    const elements = document.querySelectorAll('[data-dm-fix-applied="1"]');
    elements.forEach(el => {
      if (el.dataset.dmFixOriginal) {
        el.setAttribute('style', el.dataset.dmFixOriginal);
      }
      delete el.dataset.dmFixApplied;
    });
  }

  // ─── 6) 실행 ───
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyFix);
  } else {
    applyFix();
  }
  mql.addEventListener('change', applyFix);
})();
