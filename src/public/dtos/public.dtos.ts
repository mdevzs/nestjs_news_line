import { Exclude } from "class-transformer";

export class PaginatedOutputDto<T> {
  data: T[];
  meta: {
    total: number;
    lastPage: number;
    currentPage: number;
    perPage: number;
    prev: number | null;
    next: number | null;
  };
}

export class CountriesDto {
  name: string
  flag: string
}

export class TagsResponseDto {
  id: number
  tag: string
  imageUrl: string

  @Exclude()
  image:string

  constructor(partial: Partial<TagsResponseDto>) {
    Object.assign(this, partial)
  }
}