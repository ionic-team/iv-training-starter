import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Subject } from 'rxjs';

import { TeaCategoriesService } from '../services/tea-categories/tea-categories.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-edit-tea-category',
  templateUrl: './edit-tea-category.page.html',
  styleUrls: ['./edit-tea-category.page.scss']
})
export class EditTeaCategoryPage implements OnDestroy, OnInit {
  private id: number;
  private done: Subject<void>;
  name: string;
  description: string;

  constructor(
    private navController: NavController,
    private route: ActivatedRoute,
    private teaCategories: TeaCategoriesService
  ) {
    this.done = new Subject();
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.teaCategories
      .get(parseInt(id, 10))
      .pipe(takeUntil(this.done))
      .subscribe(c => {
        this.id = c && c.id;
        this.name = c && c.name;
        this.description = c && c.description;
      });
  }

  save() {
    this.teaCategories
      .save({
        id: this.id,
        name: this.name,
        description: this.description
      })
      .pipe(takeUntil(this.done))
      .subscribe(() => this.navController.back());
  }

  ngOnDestroy() {
    this.done.next();
    this.done.complete();
  }
}
