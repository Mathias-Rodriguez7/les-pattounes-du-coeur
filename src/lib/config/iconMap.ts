import {
	Cat,
	HouseHeart,
	PawPrint,
	Search,
	Plus,
	ClipboardList,
	Mail,
	Users,
	Newspaper,
	HeartPlus,
	PenTool,
	Dog,
	Baby,
	Trees,
	CircleCheckBig,
	CircleX,
	CircleQuestionMark
} from '@lucide/svelte';
import type { Component } from 'svelte';

export const iconMap: Record<string, Component> = {
	cat: Cat,
	house: HouseHeart,
	paw: PawPrint,
	search: Search,
	plus: Plus,
	clipboard: ClipboardList,
	mail: Mail,
	users: Users,
	news: Newspaper,
	heart: HeartPlus,
	pen: PenTool,
	dog: Dog,
	baby: Baby,
	trees: Trees,
	CircleCheck: CircleCheckBig,
	CircleX: CircleX,
	CircleQuestionMark: CircleQuestionMark
};
