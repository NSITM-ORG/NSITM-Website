// src/utils/helper/textManager.js
// import { endOfWeek, format, isToday, isYesterday, startOfWeek } from 'date-fns';
import React, { useEffect, useRef, useState } from "react";
import ReactDOM from 'react-dom';



/**
 * Truncates a message based on screen size with custom limits.
 *
 * @param {string} message - The text message to truncate.
 * @param {number} [xsLimit=20] - Character limit for extra small screens (≤340px).
 * @param {number} [smLimit=20] - Character limit for small screens (≤520px).
 * @param {number} [mdLimit=20] - Character limit for medium screens (≤768px).
 * @param {number} [lgLimit=20] - Character limit for large screens (≤992px).
 * @param {number} [xlLimit=20] - Character limit for extra large screens (>992px).
 * @returns {string} - The truncated message with ellipsis if exceeded.
 */
export const limitHandlerPerScreenSize = (message, xsLimit = 20, smLimit = 20, mdLimit = 20, lgLimit = 20, xlLimit = 20) => {
    let characterLimit;

    const xs = xsLimit ? parseInt(xsLimit) : 20;
    const sm = smLimit ? parseInt(smLimit) : 20;
    const md = mdLimit ? parseInt(mdLimit) : 20;
    const lg = lgLimit ? parseInt(lgLimit) : 20;
    const xl = xlLimit ? parseInt(xlLimit) : 20;

    if (window?.innerWidth <= 340) {
        characterLimit = xs;
    } else if (window?.innerWidth <= 520) {
        characterLimit = sm;
    } else if (window?.innerWidth <= 768) {
        characterLimit = md;
    } else if (window?.innerWidth <= 992) {
        characterLimit = lg;
    } else {
        characterLimit = xl;
    }

    const truncatedMessage = message?.length > characterLimit ? message.slice(0, characterLimit) + '...' : message;
    return truncatedMessage;
};

/**
 * Capitalizes the first letter of a given string.
 *
 * @param {string} string - Input string.
 * @returns {string} - String with the first letter capitalized.
 */
export const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * Capitalizes the first letter of each word in a string.
 *
 * @param {string} string - Input string.
 * @returns {string} - String with each word capitalized.
 */
export const capitalizeWords = (string) => {
    return string.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

/**
 * Truncates a message to a given length and appends ellipsis.
 *
 * @param {string} message - The text message to truncate.
 * @param {number} [no=10] - Maximum allowed characters.
 * @returns {string} - Truncated message.
 */
export const limitHandler = (message, no = 10) => {
    const num = parseInt(no)
    const truncatedMessage = message?.length > num ? message.slice(0, num) + '...' : message;
    return truncatedMessage;
};

/**
 * Limits numerical display to "99+" if greater than 99.
 *
 * @param {number} data - Numeric value to evaluate.
 * @returns {string|number} - "99+" if value > 99, else the original number.
 */
export const limitHandlerWithPlus = (data) => {
    let truncatedMessage;

    if (data > 99) {
        truncatedMessage = "99+";
    } else if (data <= 99) {
        truncatedMessage = data;
    }
    console.log(truncatedMessage);
    return truncatedMessage;
};

/**
 * Formats a large number into a shortened readable format (k+, m+, b+).
 *
 * @param {number} noData - Number to format.
 * @returns {string} - Formatted number string.
 */
export const limitNumberFormat = (noData) => {
    if (noData >= 1_000_000_000) {
        return `${Math.floor(noData / 1_000_000_000)}b+`;
    } else if (noData >= 1_000_000) {
        return `${Math.floor(noData / 1_000_000)}m+`;
    } else if (noData >= 1_000) {
        return `${Math.floor(noData / 1_000)}k+`;
    }
    return `${noData}`;
};

/**
 * Formats a number into k+, m+, b+ depending on entry type or size.
 *
 * @param {number} noData - Number to format.
 * @param {string} [entry='M'] - Format type ('K', 'M', 'B').
 * @returns {string} - Formatted number string.
 */
export const limitNumberFormatSet = (noData, entry = 'M') => {
    if (entry === 'B' || noData >= 1_000_000_000) {
        return `${Math.floor(noData / 1_000_000_000)}b+`;
    } else if (entry === 'M' || noData >= 1_000_000) {
        return `${Math.floor(noData / 1_000_000)}m+`;
    } else if (entry === 'K') {
        return `${Math.floor(noData / 1_000)}k+`;
    }
    return `${noData}`;
};



/**
 * ToolTipText Component - Displays truncated text that shows full text on hover
 * 
 * @param {string} text - The full text to display
 * @param {number} [xs=20] - Character limit for extra small screens (≤340px)
 * @param {number} [sm=20] - Character limit for small screens (≤520px)
 * @param {number} [md=20] - Character limit for medium screens (≤768px)
 * @param {number} [lg=20] - Character limit for large screens (≤992px)
 * @param {number} [xl=20] - Character limit for extra large screens (>992px)
 * @param {React.ReactNode} [children] - Optional children to render inside the component
 * @param {string} [className] - Additional CSS classes for the container
 * @param {Object} [style] - Additional inline styles
 * @param {string} [tooltipPosition] - Position of tooltip ('top', 'bottom')
 */
export const ToolTipText = ({
    text,
    xs = 20,
    sm = 20,
    md = 20,
    lg = 20,
    xl = 20,
    children,
    className = '',
    style = {},
    tooltipPosition = 'bottom',
    ...props
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [characterLimit, setCharacterLimit] = useState(xl);
    const [tooltipRect, setTooltipRect] = useState(null);
    const [shouldShowTooltip, setShouldShowTooltip] = useState(false);
    const containerRef = useRef(null);
    const timeoutRef = useRef(null);

    // Determine character limit based on screen size
    const getCharacterLimit = () => {
        if (typeof window === 'undefined') return xl;

        if (window.innerWidth <= 340) {
            return xs;
        } else if (window.innerWidth <= 520) {
            return sm;
        } else if (window.innerWidth <= 768) {
            return md;
        } else if (window.innerWidth <= 992) {
            return lg;
        } else {
            return xl;
        }
    };

    // Update character limit on window resize
    useEffect(() => {
        const handleResize = () => {
            const newLimit = getCharacterLimit();
            setCharacterLimit(newLimit);
            setShouldShowTooltip(text?.length > newLimit);
        };

        const newLimit = getCharacterLimit();
        setCharacterLimit(newLimit);
        setShouldShowTooltip(text?.length > newLimit);

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [xs, sm, md, lg, xl, text]);

    const handleMouseEnter = () => {
        // Only show tooltip if text is truncated
        if (!shouldShowTooltip) return;

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsHovered(true);
        setIsVisible(true);

        // Calculate position for the tooltip
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setTooltipRect(rect);
        }
    };

    const handleMouseLeave = () => {
        // Only handle leave if tooltip was showing
        if (!shouldShowTooltip) return;

        setIsHovered(false);
        // Small delay before hiding to prevent flickering when moving between elements
        timeoutRef.current = setTimeout(() => {
            if (!isHovered) {
                setIsVisible(false);
                setTooltipRect(null);
            }
        }, 100);
    };

    const handleMouseMove = () => {
        if (containerRef.current && isHovered && shouldShowTooltip) {
            const rect = containerRef.current.getBoundingClientRect();
            setTooltipRect(rect);
        }
    };

    const shouldTruncate = text?.length > characterLimit;
    const truncatedText = shouldTruncate ? text.slice(0, characterLimit) + '...' : text;

    // Tooltip component that renders in a portal
    const TooltipPortal = () => {
        if (!tooltipRect || !isVisible || !shouldShowTooltip) return null;

        const tooltipStyle = {
            position: 'fixed',
            left: tooltipRect.left + (tooltipRect.width / 2),
            transform: 'translateX(-20%)',
            zIndex: 9999,
            minWidth: '60px',
            maxWidth: '200px',
        };

        if (tooltipPosition === 'top') {
            tooltipStyle.bottom = window.innerHeight - tooltipRect.top + 8;
        } else {
            tooltipStyle.top = tooltipRect.bottom + 8;
        }

        return ReactDOM.createPortal(
            <div
                className={`
          px-3 py-2 bg-gray-800 text-white text-sm rounded-md shadow-lg
          transition-opacity duration-200
          ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
                style={tooltipStyle}
            >
                <div
                    className="break-words whitespace-normal line-clamp-3"
                    style={{
                        wordBreak: 'break-word',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}
                >
                    {text}
                </div>
                {/* Tooltip arrow */}
                <div className={`
          absolute left-[30%] transform -translate-x-1/2 border-4 border-transparent
          ${tooltipPosition === 'top'
                        ? 'top-full border-t-gray-800'
                        : 'bottom-full border-b-gray-800'
                    }
        `} />
            </div>,
            document.body
        );
    };

    return (
        <>
            <span
                ref={containerRef}
                className={`inline-block ${className} ${shouldShowTooltip ? 'cursor-help' : ''}`}
                style={style}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
                title={shouldShowTooltip ? text : undefined} // Fallback for accessibility
                {...props}
            >
                {/* Main truncated text */}
                {children || truncatedText}
            </span>

            {/* Render tooltip portal */}
            <TooltipPortal />
        </>
    );
};




// Optional: Create a hook version for more flexibility
export const useHoverAbleText = (text, limits = {}) => {
    const [truncatedText, setTruncatedText] = useState('');
    const [shouldShowTooltip, setShouldShowTooltip] = useState(false);

    useEffect(() => {
        const limit = limitHandlerPerScreenSize(
            text,
            limits.xsLimit,
            limits.smLimit,
            limits.mdLimit,
            limits.lgLimit,
            limits.xlLimit
        );
        setTruncatedText(limit);
        setShouldShowTooltip(text?.length > limit.replace('...', '').length);
    }, [text, limits]);

    return { truncatedText, shouldShowTooltip, fullText: text };
};


export const formatViewsDisplay = (views) => {
    if (views >= 1_000_000_000) {
        return `${Math.floor(views / 1_000_000_000)}b+`;
    } else if (views >= 1_000_000) {
        return `${Math.floor(views / 1_000_000)}m+`;
    } else if (views >= 1_000) {
        return `${Math.floor(views / 1_000)}k+`;
    }
    return `${views}`;
};

